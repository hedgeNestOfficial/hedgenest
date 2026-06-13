const paymentModel = require('../model/payment')
const userModel = require('../model/user')
const walletModel = require('../model/wallet')
const transactionModel = require('../model/transaction')
const conversionModel = require('../model/conversion')
const axios = require('axios')
const otpGenerator = require('otp-generator')

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
            redirect_url: 'https://hedge-nest-react-file.vercel.app/'
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
        })
        const transaction = await transactionModel.create({
            userId: user._id,
            transactionType: type,
            amount,
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
        res.status(500).json({
            message: "Error initializing payment"
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

// exports.payoutFunds = async (req, res) => {
//     try {
//         const { merchantId, amount, bankCode, accountNumber } = req.body;

//         const wallet = await WalletModel.findOne({ userId: merchantId });

//         if (!wallet) {
//             return res.status(404).json({ error: "Wallet not found." });
//         }
//         if (wallet.availableBalance < Number(amount)) {
//             return res.status(400).json({ error: "Insufficient funds for this disbursement." });
//         }

//         const transferSuccessful = true; 
//         if (!transferSuccessful) {
//             return res.status(502).json({ error: "Bank transfer failed. Try again later." });
//         }

//         wallet.availableBalance -= Number(amount);
//         await wallet.save();

//         const newTransaction = await TransactionModel.create({
//             userId: merchantId,
//             type: 'debit',
//             purpose: 'disbursement',
//             amount: Number(amount),
//             destinationAccount: accountNumber,
//             status: 'successful'
//         });

//         return res.status(200).json({
//             message: "Disbursement successful",
//             data: newTransaction
//         });

//     } catch (error) {
//         console.error("Disbursement Error:", error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };
