const smartSaveModel = require("../model/smartSave");
const transactionModel = require("../model/transaction");
const walletModel = require("../model/wallet");

function calculateNextAutoSaveDate(frequency, fromDate = new Date()) {
  const nextDate = new Date(fromDate);
  const normalizedFrequency = frequency?.toUpperCase();

  if (normalizedFrequency === "DAILY") {
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  if (normalizedFrequency === "WEEKLY") {
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  if (normalizedFrequency === "MONTHLY") {
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  return null;
}

async function runFlexibleAutoSave(options = {}) {
  const now = new Date();
  const query = {
    planType: "FLEXIBLE",
    status: "ACTIVE",
    autoSave: true,
    amountPerFrequency: { $gt: 0 },
    savingFrequency: { $in: ["DAILY", "WEEKLY", "MONTHLY"] },
  };

  if (options.userId) {
    query.userId = options.userId;
  }

  if (!options.force) {
    query.nextAutoSaveDate = { $ne: null, $lte: now };
  }

  const plans = await smartSaveModel.find(query);
  const result = {
    checkedPlans: plans.length,
    processedPlans: 0,
    completedPlans: 0,
    skippedPlans: 0,
    skippedReasons: [],
  };

  for (const plan of plans) {
    const wallet = await walletModel.findOne({ userId: plan.userId });

    if (!wallet) {
      console.log(`Auto-save: Wallet not found for user ${plan.userId}, plan ${plan._id}`);
      result.skippedPlans += 1;
      result.skippedReasons.push({
        planId: plan._id,
        reason: "Wallet not found",
      });
      continue;
    }

    const currentBalance = Number(plan.currentBalance) || 0;
    const targetAmount = Number(plan.targetAmount || plan.amount) || 0;
    const remainingAmount = targetAmount - currentBalance;

    if (remainingAmount <= 0) {
      plan.status = "COMPLETED";
      plan.nextAutoSaveDate = null;
      await plan.save();
      result.completedPlans += 1;
      continue;
    }

    const autoSaveAmount = Math.min(Number(plan.amountPerFrequency), remainingAmount);
    const walletBalance = Number(wallet.availableBalance) || 0;

    if (walletBalance < autoSaveAmount) {
      console.log(
        `Auto-save: Insufficient wallet balance for user ${plan.userId}, plan ${plan._id}`,
      );
      result.skippedPlans += 1;
      result.skippedReasons.push({
        planId: plan._id,
        reason: "Insufficient wallet balance",
        walletBalance,
        requiredAmount: autoSaveAmount,
      });
      continue;
    }

    wallet.availableBalance = walletBalance - autoSaveAmount;
    plan.currentBalance = currentBalance + autoSaveAmount;
    plan.lastAutoSaveDate = now;
    plan.nextAutoSaveDate =
      plan.currentBalance >= targetAmount
        ? null
        : calculateNextAutoSaveDate(plan.savingFrequency, now);

    if (plan.currentBalance >= targetAmount) {
      plan.status = "COMPLETED";
      result.completedPlans += 1;
    }

    await wallet.save();
    await plan.save();

    await transactionModel.create({
      userId: plan.userId,
      transactionType: "savings",
      amount: autoSaveAmount,
      currency: "NGN",
    });

    console.log(
      `Auto-save: Saved NGN ${autoSaveAmount} for user ${plan.userId}, plan ${plan._id}`,
    );

    result.processedPlans += 1;
  }

  return result;
}

module.exports = {
  calculateNextAutoSaveDate,
  runFlexibleAutoSave,
};
