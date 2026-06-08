const mongoose = require('mongoose');
const adminSchema = mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true,
            trim:true
        },
        lastName:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        isActive:{
            type:Boolean,
            default:true
        },
        password:{
            type:String,
            required:true
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        role:{
            type:String,
            default:"admin"
        },
        otp: {
            type: String,
            trim: true
        },
        otpExpires: {
            type: Date,
            default: () => {
                return Date.now() + (1000 * 60 * 7)
        }
    },
    },{timestamps:true}
)
const adminModel = mongoose.model('Admin', adminSchema)

module.exports = adminModel