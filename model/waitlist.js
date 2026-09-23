const mongoose = require("mongoose");

const ALLOWED_AMOUNT_RANGES = [
  "5000-100000-annually",
  "100000-500000-annually",
  "500000-1000000-annually",
  "1000000-5000000-annually",
  "5000000-above-annually",
  "5000-100000-monthly",
  "100000-500000-monthly",
  "500000-1000000-monthly",
  "1000000-5000000-monthly",
  "5000000-above-monthly",
  "5000-100000",
  "100000-500000",
  "500000-1000000",
  "1000000-5000000",
  "5000000-above",
  "below-5000",
];

const waitlistSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    amountRange: {
      type: String,
      required: true,
      enum: ALLOWED_AMOUNT_RANGES,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "waitlist",
      default: null,
    },
    referredByCode: {
      type: String,
      trim: true,
      default: null,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    signupBonus: {
      type: Number,
      default: 0,
    },
    referralReward: {
      type: String,
      default: "1 USDT",
      trim: true,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "verified", "approved", "active"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      trim: true,
      default: null,
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    waitlistPosition: {
      type: Number,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const waitlistModel = mongoose.model("waitlist", waitlistSchema);

module.exports = {
  waitlistModel,
  ALLOWED_AMOUNT_RANGES,
};
