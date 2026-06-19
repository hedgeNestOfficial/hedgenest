const mongoose = require("mongoose");

const savingsSchema = new mongoose.Schema({
    plan: {
        type: String,
        enum: ['FLEXIBLE', 'LOCKED', 'STEALTH'],
        required: true
    },
  duration: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 0,
    },
  },
  rates: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("saving-percentages", savingsSchema);
