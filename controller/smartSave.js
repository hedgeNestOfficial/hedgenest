const userModel = require("../model/user");
const smartSaveModel = require("../model/smartSave");
const transactionModel = require("../model/transaction");
const walletModel = require("../model/wallet");
const revenueModel = require("../model/revenue");
const { calculateNextAutoSaveDate } = require("../utils/autoSaveFlexible");
const bcrypt = require("bcrypt");

const getInterestRate = (duration) => {
  const days = Number(duration);

  if (days >= 7 && days <= 30) return 10;
  if (days >= 31 && days <= 90) return 12;
  if (days >= 91 && days <= 180) return 14;
  if (days >= 181 && days <= 365) return 16;
  if (days > 365) return 18;

  return 10; 
};

exports.previewPlan = async (req, res) => {
  try {
    const {
      title,
      amount,
      targetAmount,
      planType,
      duration,
      savingFrequency,
      amountPerFrequency,
    } = req.body;

    const normalizedPlanType = planType?.toUpperCase();
    const previewAmount = Number(targetAmount ?? amount);

    if (!title) {
      return res.status(400).json({ 
        message: "Title is required" 
      });
    }

    if (!normalizedPlanType || !["FLEXIBLE", "LOCKED", "STEALTH"].includes(normalizedPlanType)) {
      return res.status(400).json({ 
        message: "Valid planType is required (FLEXIBLE, LOCKED, STEALTH)" 
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
          message: "Duration is required" });
      }

      if (duration < 7 || duration > 1000) {
        return res.status(400).json({ 
          message: "Duration must be between 7 and 1000 days" });
      }

      interestRate = getInterestRate(duration);
      breakingFeePercentage = 1.5;
      maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + Number(duration));
    }

    if (normalizedPlanType === "STEALTH") {
      if (!duration) {
        return res.status(400).json({ 
          message: "Duration is required" });
      }

      if (duration < 7 || duration > 1000) {
        return res.status(400).json({ 
          message: "Duration must be between 7 and 1000 days" });
      }

      canBreak = false;
      interestRate = getInterestRate(duration);
      maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + Number(duration));
    }

    return res.status(200).json({
      success: true,
      data: {
        title,
        amount: previewAmount,
        targetAmount: previewAmount,
        planType: normalizedPlanType,
        duration,
        savingFrequency,
        amountPerFrequency,
        interestRate,
        canBreak,
        breakingFeePercentage,
        maturityDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message 
    });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const {
      title,
      amount,
      targetAmount,
      planType,
      duration,
      savingFrequency,
      amountPerFrequency,
      autoSave,
      transactionPin,
    } = req.body;

    const normalizedPlanType = planType?.toUpperCase();
    const planTargetAmount = targetAmount ?? amount;
    const isAutoSaveEnabled =
      normalizedPlanType === "FLEXIBLE" && autoSave === true;

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCorrectPin = await bcrypt.compare(transactionPin, user.transactionPin);

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

    const requestedAmount = Number(planTargetAmount);
    const debitAmount =
      normalizedPlanType === "FLEXIBLE"
        ? Number(amountPerFrequency || planTargetAmount)
        : requestedAmount;
    const currentBalance = Number(wallet.availableBalance);

    if (Number.isNaN(debitAmount) || debitAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid amount",
      });
    }

    if (Number.isNaN(currentBalance)) {
      return res.status(500).json({
        success: false,
        message: "Wallet balance is corrupted, contact support",
      });
    }

    if (currentBalance < debitAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        walletBalance: currentBalance,
        requiredAmount: debitAmount,
      });
    }

    const plan = new smartSaveModel({
      userId: req.user.id,
      title,
      amount: requestedAmount,
      targetAmount: requestedAmount,
      currentBalance: debitAmount,
      planType: normalizedPlanType,
      amountPerFrequency: normalizedPlanType === "FLEXIBLE" ? amountPerFrequency : null,
      savingFrequency: normalizedPlanType === "FLEXIBLE" ? savingFrequency : null,
      autoSave: isAutoSaveEnabled,
      nextAutoSaveDate:
        isAutoSaveEnabled
          ? calculateNextAutoSaveDate(savingFrequency)
          : null,
      duration,
    });

    wallet.availableBalance -= debitAmount;

    const smartVaultCount = await smartSaveModel.countDocuments({ userId: req.user.id });
    wallet.smartVaults = smartVaultCount + 1;

    await wallet.save();
    await plan.save(); // pre-save hook runs here with correct targetAmount

    await transactionModel.create({
      userId: req.user.id,
      transactionType: "savings",
      amount: debitAmount,
      currency: "NGN",
    });

    return res.status(201).json({
      success: true,
      message: "Savings plan created successfully",
      walletBalance: wallet.availableBalance,
      smartVaultCount: wallet.smartVaults,
      data: plan,
    });
  } catch (error) {
    console.log("error:", error);
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

    const isCorrectPin = await bcrypt.compare(transactionPin, user.transactionPin);
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

    if (plan.userId.toString() !== req.user.id) {
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

    const savedBalance = Number(plan.currentBalance);
    const planBalance =
      savedBalance > 0
        ? savedBalance
        : ["LOCKED", "STEALTH"].includes(plan.planType)
          ? Number(plan.amount) || 0
          : 0;

    const now = new Date();
    const isMatured = plan.maturityDate ? now >= new Date(plan.maturityDate) : false;

    if (plan.planType === "STEALTH" && !isMatured) {
      return res.status(400).json({
        success: false,
        message:
          "Stealth savings plans cannot be broken before the maturity date. Please wait until the plan matures.",
      });
    }

    let amountToCredit = planBalance;
    let breakingFee = 0;
    let statusUpdate = "CANCELLED";

    if (isMatured) {
      amountToCredit = Number(plan.totalPayback) || planBalance;
      breakingFee = 0;
      statusUpdate = "COMPLETED";
    } else if (plan.planType === "LOCKED") {
      const feePercentage =
        plan.breakingFeePercentage && plan.breakingFeePercentage > 0
          ? plan.breakingFeePercentage
          : 1.5;
      breakingFee = (feePercentage / 100) * planBalance;
      amountToCredit = planBalance - breakingFee;
      statusUpdate = "CANCELLED";
    } else if (plan.planType === "FLEXIBLE") {
      amountToCredit = planBalance;
      breakingFee = 0;
      statusUpdate = "CANCELLED";
    }

    const originalBalance = planBalance;

    // ✅ Revenue first
    if (breakingFee > 0) {
      await revenueModel.findOneAndUpdate(
        { revenueType: "breaking_fee" },
        { $inc: { totalBreakingFeeRevenue: breakingFee } },
        { upsert: true, new: true },
      );

      await revenueModel.create({
        revenueType: "breaking_fee",
        amount: breakingFee,
        description: `Breaking fee for plan ${plan._id}`,
      });
    }

    // ✅ Wallet second
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

    wallet.availableBalance = (Number(wallet.availableBalance) || 0) + amountToCredit;
    wallet.smartVaults = Math.max(0, (Number(wallet.smartVaults) || 0) - 1);
    await wallet.save();

    // ✅ Transaction third
    await transactionModel.create({
      userId: req.user.id,
      transactionType: "return",
      amount: amountToCredit,
    });

    // ✅ Save plan status LAST so retries don't hit the CANCELLED guard
    plan.status = statusUpdate;
    plan.currentBalance = 0;
    await plan.save();

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

    if (savingsPlan.userId.toString() !== userId) {
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
    const plans = await smartSaveModel.find({ userId: req.user.id });

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
    const { planId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const plan = await smartSaveModel.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        message: "Plan not found for this user",
      });
    }
    const data = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
    res.status(200).json({
      message: "User with plan gotten successfully",
      data,
      plan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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

    const plans = await smartSaveModel.find({ userId: req.user.id });

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
exports.getPreviewPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const plan = await smartSaveModel.findOne({
      _id: planId,
      userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or does not belong to this user",
      });
    }

    const normalizedPlanType = plan.planType?.toUpperCase();

    let interestRate = 10;
    let canBreak = true;
    let breakingFeePercentage = 0;
    let maturityDate = null;
    let interestBeforeTax = 0;
    let withholdingTax = 0;
    let taxAmount = 0;
    let totalPayback = Number(plan.amount) || 0;

    if (normalizedPlanType === "FLEXIBLE") {
      interestRate = 10;
      totalPayback = Number(plan.amount) || 0;
    }

    if (normalizedPlanType === "LOCKED") {
      interestRate = getInterestRate(plan.duration);
      breakingFeePercentage = 1.5;
      maturityDate = new Date(plan.createdAt);
      maturityDate.setDate(maturityDate.getDate() + Number(plan.duration));

      // ✅ Compute interest breakdown
      const principal = Number(plan.amount);
      interestBeforeTax = principal * (interestRate / 100) * (Number(plan.duration) / 365);
      taxAmount = interestBeforeTax * 0.1;
      withholdingTax = taxAmount;
      totalPayback = principal + (interestBeforeTax - taxAmount);
    }

    if (normalizedPlanType === "STEALTH") {
      canBreak = false;
      interestRate = getInterestRate(plan.duration);
      maturityDate = new Date(plan.createdAt);
      maturityDate.setDate(maturityDate.getDate() + Number(plan.duration));

      // ✅ Compute interest breakdown
      const principal = Number(plan.amount);
      interestBeforeTax = principal * (interestRate / 100) * (Number(plan.duration) / 365);
      taxAmount = interestBeforeTax * 0.1;
      withholdingTax = taxAmount;
      totalPayback = principal + (interestBeforeTax - taxAmount);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: plan._id,
        title: plan.title,
        amount: plan.amount,
        planType: normalizedPlanType,
        duration: plan.duration,
        savingFrequency: plan.savingFrequency,
        amountPerFrequency: plan.amountPerFrequency,
        interestRate,
        canBreak,
        breakingFeePercentage,
        maturityDate,
        interestBeforeTax: parseFloat(interestBeforeTax.toFixed(2)),
        withholdingTax: parseFloat(withholdingTax.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalPayback: parseFloat(totalPayback.toFixed(2)),
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
