const { SsoTokenRequest } = require("@getbrevo/brevo");
const mongoose = require("mongoose");

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
    },

    interestRate: {
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
  { timestamps: true },
);
const smartSaveModel = mongoose.model("savings", smartSaveSchema);
module.exports = smartSaveModel;
