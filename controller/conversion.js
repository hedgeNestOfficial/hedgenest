const conversionModel = require('../model/conversion')
const userModel = require('../model/user');
const walletModel = require('../model/wallet');
const transaction = require('../model/transaction')
const axios = require('axios')

exports.converionToUsdt = async (req, res) => {
    try {
        const userId = req.user.id
        let conversionAmount, usdtAmount, rate;

        const { amount, from, to } = req.body
        if (!amount || Number(amount) <= 1499 || amount == undefined || amount == null) {
            return res.status(400).json({
                message: "Enter a valid conversion amount, the minimum amount to convert is 1500"
            });
        }
        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const wallet = await walletModel.findOne({ userId: user._id })
        if (!wallet) {
            return res.status(404).json({
                message: 'Wallet not found for user'
            })
        }

        const { data } = await axios.get(
            "https://app.quidax.io/api/v1/markets/tickers/usdtngn"
        );

        console.log('data:', data)

        if (from.toUpperCase() === 'NGN') {
            rate = Number(data.data.ticker.buy) + 100;
            conversionAmount = amount / rate;
        } else {
            rate = Number(data.data.ticker.buy);
            conversionAmount = amount * rate;
        }

        wallet.balanceInNaira = conversionAmount;
        wallet.availableBalance -= conversionAmount;
        await wallet.save();
        await transaction.create({
            userId: user._id,
            transactionType: 'conversion',
            amount
        })
        res.status(200).json({
            success: true,
            rate: {
                amount: amount,
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                value: conversionAmount,
            }
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch rate",
        });
    }
}