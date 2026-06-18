const investmentModel = require('../model/investment');
const investmentPlanModel = require('../model/investmentPlan');
const walletModel = require('../model/wallet');
const userModel = require('../model/user')
const transactionModel = require('../model/transaction');
const { date } = require('joi');

exports.createInvestment = async (req, res) => {
    try {
        const { investmentPlanId, amount } = req.body;
        const userId = req.user.id;

        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const wallet = await walletModel.findOne({ userId: user._id })
        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        if (amount > wallet.availableBalance) {
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const plan = await investmentPlanModel.findById(investmentPlanId);

        if (!plan) {
            return res.status(404).json({
                message: "Investment plan not found"
            });
        }

        if (amount < plan.minAmount) {
            return res.status(400).json({
                message: `Minimum amount is ${plan.minAmount}`
            });
        };

        const { roi, term } = plan
        const expectedReturn = Number(amount) + (Number(amount) * roi / 100 * term / 365);

        const startDate = new Date
        const maturityDate = new Date(startDate);
        maturityDate.setDate(maturityDate.getDate() + term);

        wallet.availableBalance -= Number(amount);
        wallet.investments += Number(amount)

        await wallet.save()
        const investment = await investmentModel.create({
            userId,
            investmentPlanId,
            amount,
            startDate,
            maturityDate,
            expectedReturn,
            status: 'active'
        });

        const transaction = await transactionModel.create({
            userId: user._id,
            transactionType: 'investment',
            amount
        })

        res.status(201).json({
            message: "Investment activated successfully",
            data: investment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.myInvestments = async (req, res) => {
    try {
        const userId = req.user.id;
        const investments = await investmentModel.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('investmentPlanId', 'investmentName roi term');

        return res.status(200).json({
            message: "Investments retrieved successfully",
            count: investments.length,
            data: investments
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.getOneInvestment = async (req, res) => {
    try {
        const { investmentId } = req.params;
        const userId = req.user.id;
        const investment = await investmentModel.findOne({
            _id: investmentId,
            userId: userId
        }).populate('investmentPlanId');

        if (!investment) {
            return res.status(404).json({ error: "Investment not found or unauthorized access." });
        }

        return res.status(200).json({
            message: "Investment details retrieved successfully",
            data: investment
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
        message: error.message
    }
};

exports.completeInvestment = async (req, res) => {
    try {
        const { investmentId, userId } = req.body;
        const investment = await investmentModel.findOne({
            _id: investmentId,
            userId
        });

        if (!investment) {
            return res.status(404).json({
                message: "Investment not found or unauthorized."
            });
        }
        if (investment.status !== 'active') {
            return res.status(400).json({
                messagge: "This investment is no longer active."
            });
        }
        if (investment.status === 'completed') {
            return res.status(400).json({
                message: "This investment is complete already."
            });
        }
        else if (investment.status === 'claimed') {
            return res.status(400).json({
                message: "This investment has been claimed already."
            });
        }

        const currentTime = new Date()
        if (currentTime < investment.maturityDate) {
            return res.status(400).json({
                message: "Investment has not matured yet."
            });
        }

        investment.status = 'completed'
        investment.isCompleted = true

        await investment.save();

        return res.status(200).json({
            message: "Investment has reached its maturity stage,withdrawals will be available in 26 hours",
            data: {
                completeAmount: investment.expectedReturn,
                investmentStatus: investment.status
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

exports.claimInvestment = async (req, res) => {
    try {
        const { investmentId, userId } = req.body;
        const investment = await investmentModel.findOne({
            _id: investmentId,
            userId: userId
        });

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (!investment) {
            return res.status(404).json({
                message: "Investment not found."
            });
        }
        if (investment.status === 'claimed') {
            return res.status(400).json({
                message: "This investment has been claimed already."
            });
        }
        if (investment.status !== 'completed') {
            return res.status(400).json({
                messagge: "This investment is incomplete."
            });
        }
        const currentTime = new Date();
        if (currentTime < investment.maturityDate) {
            return res.status(400).json({
                message: "Investment has not reached maturity yet."
            });
        }
        const wallet = await walletModel.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        wallet.availableBalance += investment.expectedReturn;

        investment.status = 'claimed';

        await wallet.save();
        await investment.save();

        const transaction = await transactionModel.create({
            userId: user._id,
            transactionType: 'return',
            amount: investment.expectedReturn
        })

        return res.status(200).json({
            message: "Investment successfully claimed",
            data: {
                claimedAmount: investment.expectedReturn,
                newWalletBalance: wallet.availableBalance,
                investmentStatus: investment.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.breakInvestment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { investmentId } = req.params;

        const investment = await investmentModel.findOne({
            _id: investmentId,
            userId
        });

        if (!investment) {
            return res.status(404).json({
                message: "Investment not found"
            });
        }

        if (investment.status !== "active") {
            return res.status(400).json({
                message: "This investment is no longer active"
            });
        }

        const wallet = await walletModel.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }
        const plan = await investmentPlanModel.findById(investment.investmentPlanId);

        if (!plan) {
            return res.status(404).json({
                message: "Investment plan not found"
            });
        }

        if (new Date() >= investment.maturityDate) {
            return res.status(400).json({
                message: "This investment has already matured. Use the normal withdrawal process."
            });
        }

        const amount = Number(investment.amount)
        const roi = Number(plan.roi)
        const startDate = new Date(investment.startDate); const breakDate = new Date();
        const diffInMs = breakDate - startDate
        const daysInvested = Math.floor((diffInMs) / (1000 * 60 * 60 * 24));

        const expectedReturn = amount + (amount * roi * daysInvested) / (100 * 365);

        investment.status = 'terminated'
        investment.terminatedAt = new Date();

        await investment.save();

        return res.status(200).json({
            message: "Investment terminated successfully, withdrawals will be available in 26 hours",
            amount,
            expectedReturn,
            daysInvested
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

