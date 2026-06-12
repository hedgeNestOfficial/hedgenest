const userModel = require('../model/user')
const kycModel = require('../model/kyc')
const cloudinary = require('../middleware/cloudinary');
const fs = require('fs');
const bcrypt = require('bcrypt')
const axios = require('axios')


exports.kyc1Verification = async (req, res) => {
  try {
    const userId = req.user.id
    const {id} = req.body
    const verification_consent = true;

    const user = await userModel.findById(userId)
    if(!user){
      return res.status(404).json({
        message: 'User not found'
      })
    }

    if (!id) {
      return res.status(400).json({
      success: false,
      message: "NIN is required"
    });
  }
    if (id == 0) {
      return res.status(400).json({
      success: false,
      message: "NIN is invalid"
    });
  }

  const existingKyc = await kycModel.findOne({
    userId: user._id,
    isVerified: true
  });
  
  if (existingKyc) {
    return res.status(400).json({
        success: false,
        message: "Identity is already verified"
    });
}
  
  const data  = await axios.post('https://api.korapay.com/merchant/api/v1/identities/ng/nin',
    {
      id,
      verification_consent
    },
    {
      headers: {Authorization: `Bearer ${process.env.KORA_API_KEY}`,
      "Content-Type": "application/json"
    }
  })
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(id, salt)

  const kyc = new kycModel({
    userId: user._id,
    id : hashPassword,
    userFirstName: data?.data.data.first_name,
    userLastName: data?.data.data.last_name,
  })

  if (data?.data.status === true && data?.data.message === 'NIN verified successfully'){
    if (!data?.data.status) {
      return res.status(400).json({
        success: false,
        message: "NIN verification failed"
      });
    }
    const ninData = data?.data.data;
    
    const nameMatches = user.firstName.toLowerCase().trim() === ninData.first_name.toLowerCase().trim() &&
            user.lastName.toLowerCase().trim() === ninData.last_name.toLowerCase().trim();
            if (!nameMatches) {
              return res.status(400).json({
                success: false,
                message: "NIN does not match user details"
            });
          }
          
          kyc.isVerified = true;
          user.tier = 1
          await user.save();
          await kyc.save()
          res.status(200).json({
            success: true,
            message: data.message,
            data: data.data
          });
        }
      } catch (error) {
        console.error(error)
        res.status(500).json({
          success: false,
          message: "Failed to verify NIN",
        });
      }
    }

exports.uploadUtility = async (req, res) => {
  let uploadResult;

  try {
    const file = req.file;
    const { id } = req.user
    const user = await userModel.findById(id)

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found"
      })
    };

    if (user.tier < 1) {
      return res.status(403).json({
        message: "Complete Tier 1 verification before proceeding to Tier 2"
      });
    }

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
