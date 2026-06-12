const { string } = require('joi')
const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    transactionType: {
      type: String,
      enum: ['deposit', 'withdraw', 'conversion', 'savings'],
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: null
    }
}, {timestamps: true})

const transactionModel = mongoose.model('transactions', transactionSchema )
module.exports = transactionModel