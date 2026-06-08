const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    transactionType: {
      type: String,
      enum: ['deposit', 'withdraw', 'convert'],
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: Number,
      default: null
    }
}, {timestamps: true})

const transactionModel = mongoose.model('transactions', transactionSchema )
module.exports = transactionModel