const userModel = require('../model/user')
const kycModel = require('../model/kyc')
const cloudinary = require('../middleware/cloudinary');
const fs = require('fs');
const bcrypt = require('bcrypt')


exports.uploadKYC = async (req, res) => {
  const file = req.file;
  let uploadResult;

  try {
    const { id } = req.user
    const { idType, idPhoto, idNumber } = req.body;
    const user = await userModel.findById(id)

    if (user) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        status: false,
        message: "User not found"
      })
    };

    if (file && file.path) {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'id-picture'
      });

      fs.unlinkSync(file.path);
    };

    const salt = await bcrypt.genSalt(10)
    const hashNumber = await bcrypt.hash(idNumber, salt)

    const kyc = await kycModel.create({
      userId: user._id,
      idType,
      idNumber: hashNumber,
      idPhoto: uploadResult
    });

    user.tier = 1;
    await user.save();
    res.status(200).json({
      status: true,
      message: 'KYC uploaded successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    })
  }
}


exports.uploadUtility = async (req, res) => {
  const file = req.file;
  let uploadResult;

  try {
    const { id } = req.user
    const user = await userModel.findById(id)

    if (user) {
      return res.status(400).json({
        status: false,
        message: "User not found"
      })
    };
    
    const kyc = await kycModel.findOne({userId: user._id})
    
    if (kyc) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        status: false,
        message: "KYC not uploaded"
      })
    };

    if (file && file.path) {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'id-picture'
      });

      fs.unlinkSync(file.path);
    };

    kyc.utilityBill = uploadResult;
    user.tier = 2
    await kyc.save();
    await user.save();
    res.status(200).json({
      status: true,
      message: 'Utility bill uploaded successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    })
  }
}