const paymentModel = require('../model/payment')
const userModel = require('../model/user')
const walletModel = require('../model/wallet')
const transactionModel = require('../model/transaction')
const conversionModel = require('../model/conversion')
const axios = require('axios')
const otpGenerator = require('otp-generator')
const crypto = require('crypto')
const payoutModel = require('../model/payout')
const bankModel = require('../model/bank')
const revenueModel = require('../model/revenue')
const { type } = require('os')



exports.initiatePayment = async(req, res) =>{
    try {
        const userId = req.user.id
        const { amount } = req.body 

        const type = "deposit"
        if(!amount || Number(amount) <= 1499 || amount == undefined || amount == null){
            return res.status(400).json({
                message: "Enter a valid deposit amount, the minimum amount to deposit is 1500"
            });
        }
        const depositAmount = Number(amount)

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const wallet = await walletModel.findOne({ userId: user._id })
        if(!wallet){
            return res.status(404).json({
                message: 'Wallet not found for user'
            })
        }

        const ref = otpGenerator.generate(12, {specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false});
        const reference = `TCA-hedgeNest-${ref}`

        const paymentData= {
            amount: depositAmount,
            currency: 'NGN',
            reference,
            customer: {
                email: user.email,
                name: `${user.lastName} ${user.firstName}`
            },
            redirect_url: 'http://hedge-nest.vercel.app/payment-success',
            notification_url: 'https://hedgenest.onrender.com/api/v1/webhook'
        }
        const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData,{
            headers:{
                Authorization: `Bearer ${process.env.KORA_API_KEY}`  
            }
        })
        const payment = new paymentModel({
            amount: depositAmount,
            reference,
            userId,
            status: 'processing' 
        })
    
        await payment.save()
        res.status(200).json({
            message: 'Payment initialized successful',
            data: response.data?.data,
            payment
        })

    } catch (error) {
        if (
        error.response?.status === 522 ||
        error.response?.status === 502 ||
        error.response?.status === 504
    ) {
        return res.status(503).json({
            message: "Payment provider is temporarily unavailable. Please try again in a few minutes."
        });
    }
    console.log(error)
        res.status(500).json({
            message: error.message
        })
    }
}

exports.verifyPayment = async(req, res) => {
    try {
        const { reference } = req.query;
        const {data} = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        });
console.log("kora: ",data)
        const payment = await paymentModel.findOne({reference})
        if(!payment){
            return res.status(404).json({
                message: 'Payment not found'
            })
        }

        if (payment.status === "success") {
            return res.status(200).json({
                message: "Payment already verified",
                data: payment
            });
        }

        const wallet = await walletModel.findOne({
            userId: payment.userId
        });

        if(!wallet){
            return res.status(404).json({
                message: "wallet not found"
            })
        }
        if (data?.status === true && data?.data.status === 'success'){
            
            wallet.availableBalance += payment.amount;

            payment.status = data?.data.status;

            await payment.save()
            await wallet.save()

            return res.status(200).json({
                message: 'Payment verified successfully',
                data: payment
            })
        }else{
            payment.status = data?.data.status;
            await payment.save();

            return res.status(200).json({
                message: 'Payment verified successfully',
                data: payment
            })
        }
        } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Error fetching payment'
        })
    }
}

exports.verifyWebhook = async (req, res, next) => {
    try {
        const signature = req.headers["x-korapay-signature"];

        const { event, data } = req.body;
        const hash = crypto.createHmac("sha256", process.env.KORA_API_KEY).update(JSON.stringify(data)).digest("hex");
        console.log (hash)
        
        if (hash !== signature) 
            return next(new appError("Invalid webhook signature", 401));
        
        const payment = await paymentModel.findOne({ reference: data.reference });
        if (!payment) return res.status(404).json({ message: "Payment record not found" });
        
        const wallet = await walletModel.findOne({ userId: payment.userId });
        if (!wallet) return res.status(404).json({ message: "Wallet record not found" })



        if (event === 'charge.success') {
           if (payment.status !== 'success') {
                payment.status = 'success';
                
                wallet.availableBalance = (wallet.availableBalance || 0) + payment.amount;
            }

        } else if (event === 'charge.pending') {
            payment.status = 'processing';
        } else if (event === 'charge.failed') {
            payment.status = 'failed'
        } else if (event === 'charge.abandoned'){
            payment.status = 'abandoned'
        }

        const transaction = await transactionModel.create({
            userId: payment.userId,
            transactionType: 'deposit',
            amount: payment.amount,
            status: 'success',
            reference: payment.reference
        })
        
        await wallet.save();
        await payment.save();
        res.status(200).json({
            success: true,
            status: "successful",
            message: 'Payment for deposit is successfully'
        })
    
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Error fetching payment'
        })
    }

}

exports.payoutFunds = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, bankId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const bank = await bankModel.findOne({ _id: bankId, userId });

        if (!bank) {
            return res.status(404).json({
                message: "No linked bank account found"
            });
        }

        const wallet = await walletModel.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }
        const bankCode = "033"

        const amt = Number(amount);

        const withdrawalFee = 50;
        const totalDebit = amt + withdrawalFee


        if (wallet.availableBalance < totalDebit) {
            return res.status(400).json({
                message: "Insufficient funds."
            });
        }

        const ref = otpGenerator.generate(12, {
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false
        });

        const reference = `PAYOUT-hedgeNest-${ref}`;

        const { data } = await axios.post(
            "https://api.korapay.com/merchant/api/v1/transactions/disburse",
            {
                reference,
                destination: {
                    type: "bank_account",
                    amount: amt,
                    currency: "NGN",
                    narration: "Investment withdrawal",

                    customer: {
                        name: bank.accountName,
                        email: user.email
                    },
                    bank_account: {
                        bank: "033",
                        account: bank.accountNumber
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const payout = new payoutModel({
            amount: amt,
            reference,
            userId,
            bankId,
            fee: withdrawalFee
        })

        wallet.availableBalance -= totalDebit;
        await wallet.save();

        const transaction = await transactionModel.create({
            userId,
            transactionType: 'withdraw',
            amount: amt,
        });

        let revenue = await revenueModel.findOne({ });
        if (!revenue) {
            revenue = new revenueModel({
                revenueType: "withdrawal",
                totalWithdrawalRevenue: withdrawalFee
            });
        } else {
            revenue.revenueType = "withdrawal";
            revenue.totalWithdrawalRevenue += withdrawalFee;
        }
        
        await revenue.save()

        await payout.save()
        return res.status(200).json({
            message: "Payout initiated successfully",
            data: payout
        });

    } catch (error) {
        console.error("Disbursement Error:", error.response?.data || error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// if (event === 'charge.success') {

//     if (payment.status !== 'success') {

//         payment.status = 'success';

//         wallet.availableBalance += payment.amount;

//         await transactionModel.create({
//             userId: payment.userId,
//             transactionType: 'deposit',
//             amount: payment.amount,
//             reference: payment.reference,
//             status: 'success'
//         });

//         await wallet.save();
//         await payment.save();
//     }
// }

   // const transaction = await transactionModel.create({
        //     userId: user._id,
        //     transactionType: type,
        //     amount,
        // })