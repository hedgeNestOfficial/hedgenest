const mongoose = require('mongoose')

const investmentPlanSchema = new mongoose.Schema({
    investmentName: {
        type: String,
        enum: ['nestSafe 90', 'nestPortfolio', 'nestGrow 180', 'nestEquity'],
        trim: true
    },
    roi: {
        type: Number,
        trim: true
    },
    term: {
        type: Number,
        trim: true
    },
    minAmount:{
        type: Number,
        trim: true
    },
    investmentType:{
        type: String,
        enum: ['Low', 'Medium' ],
        trim: true
    },
    
}, {timestamps: true})

const investmentPlanModel = mongoose.model('investmentPlans', investmentPlanSchema)

module.exports = investmentPlanModel