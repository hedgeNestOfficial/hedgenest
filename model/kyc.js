const mongoose = require('mongoose')
const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    id: {
      type: String,
      required: true
    },
    userFirstName: {
      type: String,
      trim: true
    },
    userLastName: {
      type: String,
      trim: true
    },
    idType: {
      type: String,
      enum: ['nin'],
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false

    },
    utilityBill: {
      url: {
        type: String,
        default: null
      },
      publicId: {
        type: String,
        default: null
      }
    },
  }, { timestamps: true }
)

module.exports = mongoose.model('kycs', kycSchema)
