const { string } = require('joi');
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    investmentPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'investmentPlans',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
    },
    maturityDate: {
        type: Date,
    },
    expectedReturn: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending','active', 'completed', 'claimed', 'terminated'],
        default: 'pending'
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    terminatedAt: {
        type: Date,
        default: null
    },
    claimedAt:  {
        type: Date,
        default: null
    },
    deleteAt: {
        type: Date,
        default: null,
        index: { expires: 0 }
    }
}, {
    timestamps: true
});
