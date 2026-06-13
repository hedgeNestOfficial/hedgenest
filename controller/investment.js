const investmentModel = require('../model/investment');
const investmentPlanModel = require('../model/investmentPlan');
const walletModel = require('../model/wallet');
const userModel = require('../model/user')

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

    const wallet = await walletModel.findOne({ userId: user._id})
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
    const expectedReturn = Number(amount) + (Number(amount) * roi / 100);
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

    await transaction.create({
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
        const { userId } = req.params; 
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
        const { userId } = req.body; 
        const investment = await investmentModel.findOne({ 
            _id: investmentId, 
            userId: userId 
        }).populate('planId');

        if (!investment) {
            return res.status(404).json({ error: "Investment not found or unauthorized access." });
        }

        return res.status(200).json({
            message: "Investment details retrieved successfully",
            data: investment
        });

    } catch (error) {
        console.error("Fetch Single Investment Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.claimInvestment = async (req, res) => {
    try {
        const { investmentId, userId } = req.body; 
        const investment = await UserInvestmentModel.findOne({ 
            _id: investmentId, 
            userId: userId 
        });

        if (!investment) {
            return res.status(404).json({ error: "Investment not found or unauthorized." });
        }
        if (investment.status === 'claimed') {
            return res.status(400).json({ error: "This investment has already been claimed." });
        }
        const currentTime = new Date();
        if (currentTime < investment.maturityDate) {
            return res.status(400).json({ error: "Investment has not reached maturity yet." });
        }
        const wallet = await WalletModel.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found." });
        }

        wallet.availableBalance += investment.expectedReturn;
        
        investment.status = 'claimed';

        await wallet.save();
        await investment.save();
        
        return res.status(200).json({
            message: "Investment claimed successfully!",
            data: {
                claimedAmount: investment.expectedReturn,
                newWalletBalance: wallet.availableBalance,
                investmentStatus: investment.status
            }
        });

    } catch (error) {
        console.error("Claim Investment Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};