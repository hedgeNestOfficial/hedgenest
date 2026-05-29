const user = require('../model/user')
const userProfile = require('../model/userProfile')
const bcrypt = require('bcrypt')

exports.createUserProfile = async (req, res) => {
    try{
        const {gender, occupation, address, bvn, nin} = req.body
        const userId = req.user.id

        const profile = await userProfile.findOne({userId})
        if(profile){
            return res.status(409).json({
                message:'User profile already exists'
            })
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashBVN = await bcrypt.hash(bvn, salt)
        const hashNIN = await bcrypt.hash(nin, salt)
        
        const profileData = new userProfile({
            userId,
            gender,
            occupation,
            address,
            bvn: hashBVN,
            nin: hashNIN,
        })
        await profileData.save()

        res.status(201).json({
            message:'User profile created successfully',
            data: profileData
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:error.message
        })
    }
}
exports.getUserProfile = async (req, res) => {
    try{
        const userId = req.user.id
        const profile = await userProfile.findOne({userId}).populate('userId', '-password -otp -otpExpires')
        if(!profile){
            return res.status(404).json({
                message:'User profile not found'
            })
        }
        res.status(200).json({
            message:'User profile retrieved successfully',
            data:profile
        })
    }catch(error){
        res.status(500).json({
            message:'Internal server error'
        })
    }
}
