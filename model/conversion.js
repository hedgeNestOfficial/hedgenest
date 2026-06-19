const mongoose = require('mongoose')

const conversionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
       },
       amount: {
        type: Number,
        require: true
       },
       balanceInNaira:{
        type:  Number,
        default: 0
       },
       balanceInUSDT: {
        type:  Number,
        default: 0
       },
       from: {
        type: String,
        enum: ['NGN', 'USDT'],
        trim: true
       },
       to: {
        type: String,
        enum: ['NGN', 'USDT'],
        trim: true
       },
       rate: {
        type:  Number,
       },
       fee: {
        type:  Number,
       },
       amountNow: {
        type: Number
       }
}, { timestamps: true });
const conversionModel = mongoose.model('conversions', conversionSchema)
module.exports = conversionModel
