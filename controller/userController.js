const userModel = require('../model/user');
require('dotenv').config()
const bcrypt = require('bcrypt')
const {brevo} = require('../utils/brevo')
const {emailTemplate, resetPasswordTemplate, resetPasswordSuccessfulTemplate} = require('../email')
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken')

exports.createUser = async (req, res)=>{
    try {
       const {firstName, lastName, phoneNumber, email, password, transactionPin} = req.body

        if (transactionPin.length !== 6){
            return res.status(400).json({
                message: 'Transaction pin must be 6 digits'
            })
        }
       
        const otp = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})


        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)
        const hashTransactionPin = await bcrypt.hash(transactionPin, salt)

       const user = new userModel({
        firstName,
        lastName,
        phoneNumber,
        email: email.toLowerCase(),
        password: hashPassword,
        transactionPin: hashTransactionPin,
        otp
       }) 
       await user.save()
       brevo(user.email,user.firstName,emailTemplate(user.firstName,user.otp))
    
      

       res.status(200).json({
        message :'User created successfully',
        data: user
       })
    } catch (error) {
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        })
    }
}
exports.verifyEmail = async(req,res)=>{
    try {
        const{email, otp}= req.body
        const user = await userModel.findOne({ email: email})
        
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        if(user.otp !== otp){
            return res.status(400).json({
                message: "Invalid OTP credentials"
            })
        }
        if(Date.now()> user.otpExpires){
            return res.status(400).json({
                message:"OTP Expired"
            })
        }
        user.isVerified = true
        user.otp = null
        user.otpExpires = null
        await user.save()

        return res.status(200).json({
            message:'OTP Verified successfully',
            data: user
        })
    } catch (error) {
        console.log(error.message )
        res.status(500).json({
            message:'something went wrong'
        })
    }
}
exports.login = async (req, res)=> {
    try {
        const {email, password} = req.body
        const user = await userModel.findOne({email: email.toLowerCase()})
        if(!user){
            return res.status(400).json({
                message:'Invalid Credentials'
            })
        }
        const correctPassword = await bcrypt.compare(password, user.password)
        if(!correctPassword){
            return res.status(400).json({
                message:'Invalid Credentials'
            })
        }
        if(!user.isVerified){
            return res.status(400).json({
                message:"please verify your email"
            })
        }
         const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.SECRET_KEY,
            {expiresIn:'1d'}
        )
        return res.status(200).json({
            message:'Login Successful',
            data:{
                user,
                token
            }
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        })
    }
}
exports.forgotPassword = async (req, res)=>{
    try {
        const {email} = req.body
        const user = await userModel.findOne({email:email.toLowerCase()})
        if(!user){
            return res.status(400).json({
                message:'User not found'
            })
        }
        const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})

        user.otp = OTP

        user.otpExpires = Date.now() + ( 1000 * 60 * 5 )
        
        const data = {
            name: user.firstName,
            otp: OTP
        }
        brevo(user.email,user.firstName,resetPasswordTemplate(data))
        await user.save()

        res.status(200).json({
            message:'OTP sent to email'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error in forgot password',
            error: error.message
        })
    }   
}
exports.resetPassword = async (req, res)=>{
    try {
        const {email, otp, newPassword} = req.body
        const user = await userModel.findOne({email:email.toLowerCase()})
        if(user == null){
            return res.status(404).json({
                message:'Invalid Credentials'
            })
        }
        if ( Date.now() > user.otpExpires || user.otp !== otp ){
            return res.status(400).json({
                message:'Invalid OTP'
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashPassword
        await user.save()

        brevo(user.email, user.firstName, resetPasswordSuccessfulTemplate(user.firstName))

        res.status(200).json({
            message:'Password reset successfully'
        })  
    } catch (error) {
        res.status(500).json({
            message: 'Error in reset password',
            error: error.message
        })
    }
}
exports.changePassword = async (req, res)=>{
   try {
     const {id} = req.user
     const {oldPassword, newPassword} = req.body
     
     const user = await userModel.findById(id)
        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }
        const correctPassword = await bcrypt.compare(oldPassword, user.password)
        if(!correctPassword){
            return res.status(400).json({
                message:'Invalid Credentials'
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashPassword
        await user.save()

        res.status(200).json({
            message:'Password changed successfully'
        })
   } catch (error) {
    res.status(500).json({
        message: 'Error in change password',
        error: error.message
    })
   }
}
exports.loginWithGoogle = async (req, res)=>{
    try {
       const token = await jwt.sign({
        id: req.user._id,
        role: req.user.role
       },process.env.SECRET_KEY, {expiresIn: '1d'})
         
       res.status(200).json({
        message:'Login Successful',
        data: `${req.user.firstName} ${req.user.lastName}`,
        token
       })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
