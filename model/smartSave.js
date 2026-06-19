const mongoose = require("mongoose");
const percentageModel = require("./savingsPercent");

const smartSaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    targetAmount: {
      type: Number,
      required: true,
      min: 100,
    },

    currentBalance: {
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

    totalPayback: {
      type: Number,
      default: 0,
    },

    breakingFeePercentage: {
      type: Number,
      default: 0,
    },

    canBreak: {
      type: Boolean,
      default: true,
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
  console.log("Looking up rate for:", { planType, duration });
  const percentDoc = await percentageModel.findOne({
    plan: planType,
    "duration.min": { $lte: duration },
    "duration.max": { $gte: duration },
  });

  console.log("Found doc:", percentDoc);

  if (!percentDoc) return 0;

  return percentDoc.rates;
}

// ---- Helper: shared interest/tax math, reused by any type that locks funds ----
function computeInterestBreakdown({ principal, percentage, duration }) {
  const interestBeforeTax = principal * (percentage / 100) * (duration / 365);
  const taxAmount = interestBeforeTax * 0.1; // 10% withholding tax
  const totalPayback = principal + (interestBeforeTax - taxAmount);

  return { interestBeforeTax, taxAmount, totalPayback };
}

// ---- Per-plan-type calculators ----
const planCalculators = {
  async FLEXIBLE(plan) {
    // No lock-in, no fixed maturity. Flat interest rate, no breaking fee.
    plan.interestRate = plan.interestRate || 10;
    plan.canBreak = true;
    plan.breakingFeePercentage = 0;
    plan.maturityDate = null;

    // Interest accrues on whatever is currently saved, not the target
    const { interestBeforeTax, taxAmount, totalPayback } =
      computeInterestBreakdown({
        principal: plan.currentBalance || 0,
        percentage: plan.interestRate,
        duration: plan.duration || 0,
      });

    plan.interestBeforeTax = interestBeforeTax;
    plan.taxAmount = interestBeforeTax > 0 ? taxAmount : 0;
    plan.withholdingTax = plan.taxAmount;
    plan.totalPayback = totalPayback;
  },

  async LOCKED(plan) {
    plan.canBreak = true;
    plan.breakingFeePercentage = 1.5;

    if (plan.duration) {
      const percentage = await getPercentageForDuration(
        plan.planType,
        plan.duration,
      );
      plan.interestRate = percentage;

      const { interestBeforeTax, taxAmount, totalPayback } =
        computeInterestBreakdown({
          principal: plan.targetAmount,
          percentage,
          duration: plan.duration,
        });

      plan.interestBeforeTax = Math.floor(interestBeforeTax);
      plan.taxAmount = Math.floor(taxAmount);
      plan.withholdingTax = Math.floor(taxAmount);
      plan.totalPayback = Math.floor(totalPayback);

      if (!plan.maturityDate) {
        const maturity = new Date(plan.startDate);
        maturity.setDate(maturity.getDate() + plan.duration);
        plan.maturityDate = maturity;
      }
    }
  },

  async STEALTH(plan) {
    plan.canBreak = false;
    plan.breakingFeePercentage = 0; // not applicable, can't break anyway

    if (plan.duration) {
      const percentage = await getPercentageForDuration(
        plan.planType,
        plan.duration,
      );
      plan.interestRate = percentage;

      const { interestBeforeTax, taxAmount, totalPayback } =
        computeInterestBreakdown({
          principal: plan.targetAmount,
          percentage,
          duration: plan.duration,
        });

      plan.interestBeforeTax = Math.floor(interestBeforeTax);
      plan.taxAmount = Math.floor(taxAmount);
      plan.withholdingTax = Math.floor(taxAmount);
      plan.totalPayback = Math.floor(totalPayback);

      if (!plan.maturityDate) {
        const maturity = new Date(plan.startDate);
        maturity.setDate(maturity.getDate() + plan.duration);
        plan.maturityDate = maturity;
      }
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
