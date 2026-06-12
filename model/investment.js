const { string } = require('joi');
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nestType: {
        type: String,
        enum: ['nestSafe 90', 'nestPortfolio', 'nestGrow 180', 'nestEquity'],
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    roi: {
        type: Number,
        default: 10 
    },
    term: {
        type: Number,
    },
    expectedReturn: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending','active', 'completed'],
        default: 'pending'
    },
    maturityDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Investment', investmentSchema);