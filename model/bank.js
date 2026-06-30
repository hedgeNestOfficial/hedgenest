const mongoose = require('mongoose')
const bankSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    currency: {
      type: String,
      enum: ['NGN'],
      uppercase: true
    },
    bankName: {
      type: String,
      required: true,
      uppercase: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    bankCode: {
      type: Number,
      default: 0
    }
  }, { timestamps: true }
)

module.exports = mongoose.model('banks', bankSchema)