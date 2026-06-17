const mongoose = require('mongoose')

const revenueSchema = new mongoose.Schema({
    totalConversionRevenue: {
        type: Number,
        default: 0
    },
    totalBreakingFeeRevenue: {
        type: Number,
        default: 0
    },
    revenueType: {
        type: String,
        enum: ["conversion", "withdrawal", "savings", "breaking_fee"],
    },
    amount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Revenues', revenueSchema)