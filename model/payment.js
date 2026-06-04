const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    reference: {
        type: String,
        require: true
    },
    userName:{
        type: String
    },
    status: {
        type: String,
        enum: ['processing', 'success', 'failed', 'abandoned'],
        default: 'processing'
    },
},{timestamps: true})

// create payment model
const paymentModel = mongoose.model('payments', paymentSchema);

module.exports = paymentModel;