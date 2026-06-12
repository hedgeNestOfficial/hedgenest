const mongoose = require('mongoose')

const revenueSchema = new mongoose.Schema({
    totalConversionRevenue: {
        type: Number,
        default: 0
    },
    revenueType: {
        type: String,
        enum: ["conversion", "withdrawal", "savings"],
    },
    totalConversionRevenue: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('Revenues', revenueSchema)