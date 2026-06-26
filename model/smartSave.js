const mongoose = require("mongoose");
const percentageModel = require("./savingsPercent");

const smartSaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    planType: {
      type: String,
      enum: ["FLEXIBLE", "LOCKED", "STEALTH"],
      required: true,
      uppercase: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    targetAmount: {
      type: Number,
      default: 0,
    },

    amountPerFrequency: {
      type: Number,
      default: null,
    },

    savingFrequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      default: null,
      uppercase: true,
    },

    duration: {
      type: Number,
      default: null,
      min: 1,
    },

    interestRate: {
      type: Number,
      default: 0,
    },

    withholdingTax: {
      type: Number,
      default: 0,
    },

    interestBeforeTax: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    interestAfterTax: {
      type: Number,
      default: 0,
    },

    totalPayback: {
      type: Number,
      default: 0,
    },

    currentBalance: {
      type: Number,
      default: 0,
    },

    breakingFeePercentage: {
      type: Number,
      default: 0,
    },

    canBreak: {
      type: Boolean,
      default: function () {
        return this.planType !== "STEALTH";
      },
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    maturityDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
      uppercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// ---- Helper: fetch interest % for a given plan type + duration band ----
async function getPercentageForDuration(planType, duration) {
  const percentDoc = await percentageModel.findOne({
    plan: planType,
    "duration.min": { $lte: duration },
    "duration.max": { $gte: duration },
  });

  if (!percentDoc) return 0;

  return percentDoc.rates;
}

// ---- Shared Interest Calculator ----
// withholdingTaxRate is a percentage, e.g. 10 means 10%
function calculateReturns({ principal, interestRate, duration, withholdingTaxRate = 10 }) {
  const interestBeforeTax = (principal * interestRate * duration) / (100 * 365);
  const taxAmount = interestBeforeTax * (withholdingTaxRate / 100);
  const interestAfterTax = interestBeforeTax - taxAmount;
  const totalPayback = principal + interestAfterTax;

  return {
    interestBeforeTax: Number(interestBeforeTax.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    interestAfterTax: Number(interestAfterTax.toFixed(2)),
    totalPayback: Number(totalPayback.toFixed(2)),
  };
}

// ---- Per-plan-type calculators ----
const planCalculators = {
  async FLEXIBLE(plan) {
    const WITHHOLDING_TAX_RATE = 10; // 10%

    plan.interestRate = 10;
    plan.canBreak = true;
    plan.breakingFeePercentage = 0;
    plan.maturityDate = null;
    // ✅ store the rate (10), not a computed amount
    plan.withholdingTax = WITHHOLDING_TAX_RATE;

    // ✅ use plan.amount (savingsGoal = targetAmount) NOT currentBalance
    //    so interest matches previewPlan which uses the full target amount
    const principal = Number(plan.amount || 0);

    const frequencyDays = {
      DAILY: 1,
      WEEKLY: 7,
      MONTHLY: 30,
    };

    const duration = frequencyDays[plan.savingFrequency] || 30;

    const result = calculateReturns({
      principal,
      interestRate: 10,
      duration,
      withholdingTaxRate: WITHHOLDING_TAX_RATE,
    });

    plan.interestBeforeTax = result.interestBeforeTax;
    plan.taxAmount = result.taxAmount;
    plan.interestAfterTax = result.interestAfterTax;
    plan.totalPayback = result.totalPayback;
  },

  async LOCKED(plan) {
    const WITHHOLDING_TAX_RATE = 10; // 10%

    plan.canBreak = true;
    plan.breakingFeePercentage = 1.5;
    // ✅ store the rate (10), not a computed amount
    plan.withholdingTax = WITHHOLDING_TAX_RATE;

    if (!plan.duration) return;

    const percentage = await getPercentageForDuration(plan.planType, plan.duration);
    plan.interestRate = percentage;

    const result = calculateReturns({
      principal: Number(plan.amount),
      interestRate: percentage,
      duration: Number(plan.duration),
      withholdingTaxRate: WITHHOLDING_TAX_RATE,
    });

    plan.interestBeforeTax = result.interestBeforeTax;
    plan.taxAmount = result.taxAmount;
    plan.interestAfterTax = result.interestAfterTax;
    plan.totalPayback = result.totalPayback;

    if (!plan.maturityDate) {
      const maturity = new Date(plan.startDate);
      maturity.setDate(maturity.getDate() + Number(plan.duration));
      plan.maturityDate = maturity;
    }
  },

  async STEALTH(plan) {
    const WITHHOLDING_TAX_RATE = 10; // 10%

    plan.canBreak = false;
    plan.breakingFeePercentage = 0;
    // ✅ store the rate (10), not a computed amount
    plan.withholdingTax = WITHHOLDING_TAX_RATE;

    if (!plan.duration) return;

    const percentage = await getPercentageForDuration(plan.planType, plan.duration);
    plan.interestRate = percentage;

    const result = calculateReturns({
      principal: Number(plan.amount),
      interestRate: percentage,
      duration: Number(plan.duration),
      withholdingTaxRate: WITHHOLDING_TAX_RATE,
    });

    plan.interestBeforeTax = result.interestBeforeTax;
    plan.taxAmount = result.taxAmount;
    plan.interestAfterTax = result.interestAfterTax;
    plan.totalPayback = result.totalPayback;

    if (!plan.maturityDate) {
      const maturity = new Date(plan.startDate);
      maturity.setDate(maturity.getDate() + Number(plan.duration));
      plan.maturityDate = maturity;
    }
  },
};

smartSaveSchema.pre("save", async function (next) {
  try {
    const calculator = planCalculators[this.planType];
    if (calculator) {
      await calculator(this);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const smartSaveModel = mongoose.model("Savings", smartSaveSchema);

module.exports = smartSaveModel;