const userModel = require("../model/user");
const smartSaveModel = require("../model/smartSave");
const transactionModel = require("../model/transaction");
const walletModel = require("../model/wallet");
const revenueModel = require("../model/revenue");
const bcrypt = require("bcrypt");
const {
  caculateSavings,
  getInterestRate,
} = require("../utils/savingsCaculator");

exports.previewPlan = async (req, res) => {
  try {
    const {
      title,
      targetAmount,
      planType,
      duration,
      savingFrequency,
      amountPerFrequency,
    } = req.body;
    const normalizedPlanType = planType?.toUpperCase();

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Target amount is required",
      });
    }

    let interestRate = 10;
    let canBreak = true;
    let breakingFeePercentage = 0;
    let maturityDate = null;

    if (normalizedPlanType === "FLEXIBLE") {
      interestRate = 10;
    }

    if (normalizedPlanType === "LOCKED") {
      if (!duration) {
        return res.status(400).json({
          success: false,
          message: "Duration is required",
        });
      }

      if (duration < 7 || duration > 1000) {
        return res.status(400).json({
          success: false,
          message: "Duration must be between 7 and 1000 days",
        });
      }

      interestRate = getInterestRate(duration);

      breakingFeePercentage = 1.5;

      maturityDate = new Date();

      maturityDate.setDate(maturityDate.getDate() + Number(duration));
    }

    if (normalizedPlanType === "STEALTH") {
      canBreak = false;

      interestRate = getInterestRate(duration);

      maturityDate = new Date();

      maturityDate.setDate(maturityDate.getDate() + Number(duration));
    }

    const savingsCalculations = caculateSavings({
      amount: targetAmount,
      duration: duration || 365,
      interestRate,
    });

    return res.status(200).json({
      success: true,

      data: {
        title,
        targetAmount,
        planType: normalizedPlanType,
        duration,
        savingFrequency,
        amountPerFrequency,

        interestRate,
        canBreak,
        breakingFeePercentage,

        maturityDate,

        ...savingsCalculations,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.createPlan = async (req, res) => {
  try {
    const {
      title,
      targetAmount,
      planType,
      duration,
      savingFrequency,
      amountPerFrequency,
      transactionPin,
    } = req.body;

    if (!amountPerFrequency || Number(amountPerFrequency) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount per frequency is required for savings",
      });
    }

    const normalizedPlanType = planType?.toUpperCase();
    const normalizedSavingFrequency = savingFrequency?.toUpperCase();

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCorrectPin = await bcrypt.compare(
      transactionPin,
      user.transactionPin,
    );

    if (!isCorrectPin) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction pin",
      });
    }

    const wallet = await walletModel.findOne({ userId: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (wallet.availableBalance < Number(amountPerFrequency)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    wallet.availableBalance -= Number(amountPerFrequency);

    let interestRate = 10;
    let canBreak = true;
    let breakingFeePercentage = 0;
    let maturityDate = null;

    if (normalizedPlanType === "FLEXIBLE") {
      interestRate = 10;
    }

    if (normalizedPlanType === "LOCKED") {
      interestRate = getInterestRate(duration);
      breakingFeePercentage = 1.5;
      maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + Number(duration));
    }

    if (normalizedPlanType === "STEALTH") {
      canBreak = false;
      interestRate = getInterestRate(duration);
      maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + Number(duration));
    }

    const plan = await smartSaveModel.create({
      user: req.user.id,
      title,
      targetAmount,
      planType: normalizedPlanType,
      currentBalance: amountPerFrequency,
      amountPerFrequency,
      savingFrequency: normalizedSavingFrequency,
      duration,
      interestRate,
      canBreak,
      breakingFeePercentage,
      maturityDate,
    });

    // Count the user's savings plans (smart vaults), not their value
    const smartVaultsCount = await smartSaveModel.countDocuments({
      user: req.user.id,
    });

    // Persist the count on the wallet so other endpoints (e.g. balance fetch)
    // pick up the correct number instead of an amount
    wallet.smartVaults = smartVaultsCount;
    await wallet.save();

    await transactionModel.create({
      userId: req.user.id,
      transactionType: "savings",
      amount: Number(amountPerFrequency ?? targetAmount),
      currency: "NGN",
    });

    return res.status(201).json({
      success: true,
      message: "Savings plan created successfully",
      smartVaultsCount,
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.breakPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { transactionPin } = req.body;

    if (!transactionPin) {
      return res.status(400).json({
        message: "Transaction pin is required",
      });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isCorrectPin = await bcrypt.compare(
      transactionPin,
      user.transactionPin,
    );
    if (!isCorrectPin) {
      return res.status(400).json({
        message: "Invalid transaction pin",
      });
    }

    const plan = await smartSaveModel.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Savings plan not found",
      });
    }

    if (plan.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: This plan does not belong to you",
      });
    }

    if (plan.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: `Cannot break a plan with status: ${plan.status}`,
      });
    }

    if (plan.currentBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "Plan has no balance to withdraw",
      });
    }

    const now = new Date();

    // FIX 1: isMatured now returns false instead of null when maturityDate is not set
    const isMatured = plan.maturityDate
      ? now >= new Date(plan.maturityDate)
      : false;

    // STEALTH: No withdrawal before maturity date
    if (plan.planType === "STEALTH" && !isMatured) {
      return res.status(400).json({
        success: false,
        message:
          "Stealth savings plans cannot be broken before the maturity date. Please wait until the plan matures.",
      });
    }

    let amountToCredit = plan.currentBalance;
    let breakingFee = 0;
    let statusUpdate = "CANCELLED";

   

    if (isMatured) {
      // Any plan type that has matured — full withdrawal, mark as COMPLETED
      amountToCredit = plan.currentBalance;
      breakingFee = 0;
      statusUpdate = "COMPLETED";
    } else if (plan.planType === "LOCKED") {
      // FIX 2: Locked plan broken before maturity — charge breaking fee
      // Default to 1.5% if breakingFeePercentage is missing or zero in DB
      const feePercentage =
        plan.breakingFeePercentage && plan.breakingFeePercentage > 0
          ? plan.breakingFeePercentage
          : 1.5;

      breakingFee = (feePercentage / 100) * plan.currentBalance;
      amountToCredit = plan.currentBalance - breakingFee;
      statusUpdate = "CANCELLED";
    } else if (plan.planType === "FLEXIBLE") {
      // FLEXIBLE plans — always full withdrawal, no fee
      amountToCredit = plan.currentBalance;
      breakingFee = 0;
      statusUpdate = "CANCELLED";
    }

    // Update plan
    const originalBalance = plan.currentBalance;
    plan.status = statusUpdate;
    plan.currentBalance = 0;
    await plan.save();

    // Record breaking fee to revenue if applicable
    if (breakingFee > 0) {
      await revenueModel.findOneAndUpdate(
        { revenueType: "breaking_fee" },
        {
          $inc: {
            totalBreakingFeeRevenue: breakingFee,
          },
        },
        { upsert: true, new: true }
      );

      // Also create a transaction record for this breaking fee
      await revenueModel.create({
        revenueType: "breaking_fee",
        amount: breakingFee,
        description: `Breaking fee for plan ${plan._id}`,
      });
    }

    // Credit user's wallet
    let wallet = await walletModel.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = await walletModel.create({
        userId: req.user.id,
        availableBalance: 0,
        balanceInNaira: 0,
        balanceInUSDT: 0,
        smartVaults: 0,
        investments: 0,
      });
    }

    wallet.availableBalance += amountToCredit;
    wallet.balanceInNaira += amountToCredit;
    wallet.smartVaults -= originalBalance;  
    await wallet.save();

    // Create transaction record
    await transactionModel.create({
      userId: req.user.id,
      transactionType: "return",
      amount: amountToCredit,
    });

    // FIX 3: Return originalBalance instead of plan.currentBalance (which is now 0)
    return res.status(200).json({
      success: true,
      message: isMatured
        ? "Plan matured. Full balance withdrawn successfully."
        : plan.planType === "LOCKED"
          ? `Plan broken early. A breaking fee of ₦${breakingFee.toFixed(2)} was deducted.`
          : "Plan withdrawn successfully.",
      data: {
        planId: plan._id,
        planType: plan.planType,
        status: plan.status,
        isMatured,
        originalBalance,
        breakingFee: parseFloat(breakingFee.toFixed(2)),
        amountCredited: parseFloat(amountToCredit.toFixed(2)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.topUpFlexible = async (req, res) => {
  try {
    const { amount, transactionPin } = req.body;
    const { savingId } = req.params;
    const savingsId = savingId;
    const userId = req.user.id;

    if (!amount || !transactionPin) {
      return res.status(400).json({
        message: "Amount and transaction pin are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Enter a valid amount",
      });
    }

    // Verify user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify transaction pin against user (not wallet)
    const isPinValid = await bcrypt.compare(
      String(transactionPin),
      user.transactionPin,
    );
    if (!isPinValid) {
      return res.status(400).json({
        message: "Invalid transaction pin",
      });
    }

    // Find or create wallet
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) {
      wallet = await walletModel.create({ userId });
    }

    // Find savings plan
    const savingsPlan = await smartSaveModel.findById(savingsId);
    if (!savingsPlan) {
      return res.status(404).json({
        message: "Savings plan not found",
      });
    }

    if (savingsPlan.user.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized: This plan does not belong to you",
      });
    }

    if (savingsPlan.planType !== "FLEXIBLE") {
      return res.status(400).json({
        message: "This plan does not support top up",
      });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }

    // Deduct from wallet and add to savings
    wallet.availableBalance -= Number(amount);
    await wallet.save();

    savingsPlan.currentBalance += Number(amount);
    await savingsPlan.save();

    const transaction = await transactionModel.create({
      userId,
      transactionType: "savings",
      amount: Number(amount),
    });

    res.status(200).json({
      message: "Top up successful",
      data: {
        savingsName: savingsPlan.title,
        newSavingsBalance: savingsPlan.currentBalance,
        newWalletBalance: wallet.availableBalance,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.getAllPlan = async (req, res) => {
  try {
    const plans = await smartSaveModel.find({ user: req.user.id });

    res.status(200).json({
      message: "Found all Plans",
      plans,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.getOnePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const existingPlan = await smartSaveModel.findById(id);

    if (!existingPlan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }
    res.status(200).json({
      message: "Plan found successfully",
      data: existingPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.getUserWithPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId }= req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }
    const plan = await smartSaveModel.findOne({ _id: planId, user: userId });
    if (!plan) {
      return res.status(404).json({ 
        message: "Plan not found for this user" 
      });
    }
     const data = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }
    res.status(200).json({
      message: "User with plan gotten successfully",
      data,
      plan,
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};
exports.getUserWithPlans = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const plans = await smartSaveModel.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: "User with all plans retrieved successfully",
      totalPlans: plans.length,
      user,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
