const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    phoneNumber:{
        type:String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    transactionPin:{
        type: String,
        default: null
    },
     isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
    otp: {
    type: String,
    trim: true
    },
    otpExpires:{
      type:Date,
      default:()=>{
        return Date.now() + ( 1000 * 60 * 5 )
      }
    },
}, {timestamps: true})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel
