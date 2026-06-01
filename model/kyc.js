const mongoose = require('mongoose')
const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    idType: {
      type: String,
      enum: ['nin', 'bvn'],
      lowercase: true,
      required: true
    },
    idNumber: {
      type: String,
      required: true
    },
    idPhoto: {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
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