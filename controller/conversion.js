const conversionModel = require('../model/conversion')
const userModel = require('../model/user');
const paymentModel = require('../model/payment')
const walletModel = require('../model/wallet');
const transaction = require('../model/transaction')
const revenueModel = require('../model/revenue')
const axios = require('axios')

exports.liveRate = async(req, res) =>{
    try {
        const { data } = await axios.get(
            "https://app.quidax.io/api/v1/markets/tickers/usdtngn"
        );

        usdtRate = Number(data.data.ticker.buy)
        rate = Number(data.data.ticker.buy) + 50;

        res.status(200).json({
            success: true,
            rate,
            usdtRate
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch rate",
        });
    }
}

exports.conversion = async (req, res) => {
    try {
        const userId = req.user.id
        let conversionAmount, rate;

        const { amount, from, to } = req.body
        if (!amount || amount == undefined || amount == null ) {
            return res.status(400).json({
                message: "Enter a valid conversion amount, the minimum amount to convert is #1,500 0r 1.40USDT"
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

        const conversionFee = 50;
        const totalDebit = Number(amount) + conversionFee


        if (totalDebit > wallet.availableBalance) {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance"
            });
        }

        const { data } = await axios.get(
            "https://app.quidax.io/api/v1/markets/tickers/usdtngn"
        );

        const supportedCurrencies = ['NGN', 'USDT'];
        if (!supportedCurrencies.includes(from?.toUpperCase()) || !supportedCurrencies.includes(to?.toUpperCase())) {
            return res.status(400).json({
                message: "Invalid currency"
            });
        }
        if (from?.toUpperCase() === "NGN") {
            if (Number(amount) < 1500) {
                return res.status(400).json({
                    message: "Minimum NGN conversion amount is ₦1500"
                });
            }
            
            if (totalDebit > wallet.availableBalance) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient wallet balance"
                });
            }
        }
        
        if (from?.toUpperCase() === "USDT") {
            if (Number(amount) < 1.40) {
                return res.status(400).json({
                    message: "Minimum USDT conversion amount is 1.40 USDT"
                });
            }
            if (Number(amount) > wallet.balanceInUSDT) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient USDT balance"
                });
            }
        }
        if (from.toUpperCase() === 'NGN') {
            rate = Number(data.data.ticker.buy) + 50;
            
            conversionAmount = Number(amount) / rate;
            
            wallet.availableBalance -= Number(totalDebit.toFixed(2));
            wallet.balanceInNaira += Number(amount)
            wallet.balanceInUSDT += Number(conversionAmount.toFixed(2));

            conversion = new conversionModel({
                userId: user._id,
                amount,
                balanceInNaira: wallet.balanceInNaira ,
                balanceInUSDT: wallet.balanceInUSDT,
                from,
                to,
                rate,
                fee: conversionFee,
                conversionAmount: amount,
                amountNow: Number(conversionAmount.toFixed(2))
            });   

        } else if (from.toUpperCase() === 'USDT') {
            if (Number(amount) > wallet.balanceInUSDT) {
                return res.status(400).json({
                    message: "Insufficient USDT balance"
                });
            }
            rate = Number(data.data.ticker.buy);conversionAmount = Number(amount) * rate;
            
            wallet.balanceInUSDT -= Number(amount);
            wallet.balanceInNaira -= Number(conversionAmount.toFixed(2))
            wallet.availableBalance += Number(conversionAmount.toFixed(2))

            conversion = new conversionModel({
                userId: user._id,
                amount,
                balanceInNaira: wallet.balanceInNaira,
                balanceInUSDT: wallet.balanceInUSDT,
                from,
                to,
                rate,
                fee: 0,
                conversionAmount: amount,
                amountNow: Number(conversionAmount.toFixed(2))
            });
        }

        let revenue = await revenueModel.findOne({ });

        if (!revenue) {
            revenue = new revenueModel({
                revenueType: "conversion",
                totalConversionRevenue: conversionFee
            });
        } else {
            revenue.revenueType = "conversion";
            revenue.totalConversionRevenue += conversionFee;
        }

        await revenue.save()
        await conversion.save()
        await wallet.save();
        await transaction.create({
            userId: user._id,
            transactionType: 'conversion',
            currency: from,
            amount
        })
        res.status(200).json({
            success: true,
            rate: {
                amount: amount,
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                rate,
                value: Number(conversionAmount.toFixed(2)),
            }
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to convert",
        });
    }
}

exports.myConversion = async (req, res) => {
    try {
        const userId = req.user.id; 
        const conversion = await conversionModel.find({ userId: userId })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: "Conversion retrieved successfully",
            count: conversion.length,
            data: conversion
        });

    } catch (error) {
        return res.status(500).json({ 
            message: error.message
        });
    }
};