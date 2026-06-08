const mongoose = require('mongoose')

const smartSaveSchema = new mongoose.Schema({
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
}, {timestamps: true})
const smartSaveModel = mongoose.model('savings', smartSaveSchema )
module.exports = smartSaveModel