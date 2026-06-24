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
      default: 10,
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
      default: function(){
        if(this.planType === "STEALTH"){
          return false
        }else{
          return true
        }
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
function calculateReturns({
  principal,
  interestRate,
  duration,
  withholdingTax = 10,
}) {
  const interestBeforeTax =
    (principal * interestRate * duration) /
    (100 * 365);

  const taxAmount =
    interestBeforeTax * (withholdingTax / 100);

  const interestAfterTax =
    interestBeforeTax - taxAmount;

  const totalPayback =
    principal + interestAfterTax;

  return {
    interestBeforeTax: Number(
      interestBeforeTax.toFixed(2)
    ),

    taxAmount: Number(
      taxAmount.toFixed(2)
    ),

    interestAfterTax: Number(
      interestAfterTax.toFixed(2)
    ),

    totalPayback: Number(
      totalPayback.toFixed(2)
    ),
  };
}

// ---- Per-plan-type calculators ----
const planCalculators = {
  async FLEXIBLE(plan) {
    plan.interestRate = 10;
    plan.canBreak = true;
    plan.breakingFeePercentage = 0;
    plan.maturityDate = null;
    plan.withholdingTax = 10;

    const principal = Number(
      plan.currentBalance || 0
    );

    const frequencyDays = {
      DAILY: 1,
      WEEKLY: 7,
      MONTHLY: 30,
    };

    const duration =
      frequencyDays[plan.savingFrequency] || 30;

    const result = calculateReturns({
      principal,
      interestRate: 10,
      duration,
    });

    plan.interestBeforeTax =
      result.interestBeforeTax;

    plan.taxAmount =
      result.taxAmount;

    plan.interestAfterTax =
      result.interestAfterTax;

    plan.totalPayback =
      result.totalPayback;
  },

  async LOCKED(plan) {
    plan.canBreak = true;
    plan.breakingFeePercentage = 1.5;
    plan.withholdingTax = 10;

    if (!plan.duration) return;

    const percentage =
      await getPercentageForDuration(
        plan.planType,
        plan.duration
      );

    plan.interestRate = percentage;

    const result = calculateReturns({
      principal: Number(plan.amount),
      interestRate: percentage,
      duration: Number(plan.duration),
    });

    plan.interestBeforeTax =
      result.interestBeforeTax;

    plan.taxAmount =
      result.taxAmount;

    plan.interestAfterTax =
      result.interestAfterTax;

    plan.totalPayback =
      result.totalPayback;

    if (!plan.maturityDate) {
      const maturity = new Date(
        plan.startDate
      );

      maturity.setDate(
        maturity.getDate() +
          Number(plan.duration)
      );

      plan.maturityDate = maturity;
    }
  },

  async STEALTH(plan) {
    plan.canBreak = false;
    plan.breakingFeePercentage = 0;
    plan.withholdingTax = 10;

    if (!plan.duration) return;

    const percentage =
      await getPercentageForDuration(
        plan.planType,
        plan.duration
      );

    plan.interestRate = percentage;

    const result = calculateReturns({
      principal: Number(plan.amount),
      interestRate: percentage,
      duration: Number(plan.duration),
    });

    plan.interestBeforeTax =
      result.interestBeforeTax;

    plan.taxAmount =
      result.taxAmount;

    plan.interestAfterTax =
      result.interestAfterTax;

    plan.totalPayback =
      result.totalPayback;

    if (!plan.maturityDate) {
      const maturity = new Date(
        plan.startDate
      );

      maturity.setDate(
        maturity.getDate() +
          Number(plan.duration)
      );

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