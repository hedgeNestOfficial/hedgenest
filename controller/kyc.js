const userModel = require('../model/user')
const kycModel = require('../model/kyc')
const cloudinary = require('../middleware/cloudinary');
const fs = require('fs');
const bcrypt = require('bcrypt')

const deleteTempFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}


exports.uploadKYC = async (req, res) => {
  const file = req.file;
  let uploadResult;

  try {
    const { id } = req.user
    const { idNumber } = req.body;
    const idType = req.body.idType?.toLowerCase();
    const user = await userModel.findById(id)

    if (!user) {
      deleteTempFile(file);
      return res.status(400).json({
        status: false,
        message: "User not found"
      })
    };

    if (!['nin', 'bvn'].includes(idType)) {
      deleteTempFile(file);
      return res.status(400).json({
        status: false,
        message: "ID type must be either nin or bvn"
      })
    }

    if (idType === 'nin' && !file?.path) {
      return res.status(400).json({
        status: false,
        message: "ID photo is required for NIN"
      })
    }

    if (file?.path) {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'id-picture'
      });

      fs.unlinkSync(file.path);
    }

    const salt = await bcrypt.genSalt(10)
    const hashNumber = await bcrypt.hash(idNumber, salt)

    const data = {
      userId: user._id,
      idType,
      idNumber: hashNumber
    };

    if (uploadResult) {
      data.idPhoto = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    }

    const kyc = await kycModel.create(data);

    user.tier = 1;
    await user.save();
    res.status(200).json({
      status: true,
      message: 'KYC uploaded successfully',
      tier: user.tier
    })
  } catch (error) {
    deleteTempFile(file);
    res.status(500).json({
      message: 'Error uploading KYC',
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

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found"
      })
    };
    
    const kyc = await kycModel.findOne({userId: user._id}).sort({ createdAt: -1 })
    
    if (!kyc) {
      deleteTempFile(file);
      return res.status(400).json({
        status: false,
        message: "KYC not uploaded"
      })
    };

    if (!file?.path) {
      return res.status(400).json({
        status: false,
        message: "Utility bill is required"
      })
    }

    uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'utility-bill'
    });

    fs.unlinkSync(file.path);

    const utilityBill = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };

    kyc.utilityBill = utilityBill;
    user.tier = 2;

    await kyc.save();
    await user.save();

    res.status(200).json({
      status: true,
      message: 'Utility bill uploaded successfully',
      utilityBill: kyc.utilityBill,
      tier: user.tier
    })
  } catch (error) {
    deleteTempFile(file);
    res.status(500).json({
      message: 'Error uploading utility bill',
      error: error.message
    })
  }
}
