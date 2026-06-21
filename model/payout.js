const mongoose = require('mongoose')

const payoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        require: true
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "banks",
      required: true
    },
    amount: {
        type: Number,
        require: true
    },
    accountNumber:{
        type: String
    },
    reference: {
      type: String,
      unique: true
    },

},{timestamps: true})

const payoutModel = mongoose.model('payouts', payoutSchema);

module.exports = payoutModel;