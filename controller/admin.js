const user = require('../model/user')
const wallet = require('../model/wallet')
const payment = require('../model/payment')
const admin = require('../model/admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const{sendEmail} = require('../utils/brevo')
const {emailTemplate, resetPasswordTemplate, resetPasswordSuccessfulTemplate} = require('../email')
const userModel = require('../model/user')
const paymentModel = require('../model/payment')
const transactionModel = require('../model/transaction')
const revenueModel = require('../model/revenue')

exports.createAdmin = async (req, res)=>{
    try{
        const {firstName, lastName, email, phoneNumber, password} = req.body

        const existingAdmin = await admin.findOne({email:email.toLowerCase()})
        if(existingAdmin){
            return res.status(400).json({
                message:"Admin with this email already exist"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const newAdmin = await new admin({
            firstName,
            lastName,
            email:email.toLowerCase(),
            phoneNumber,
            password:hashPassword,
            otp,
            otpExpires: Date.now() + (1000 * 60 * 7)
        })
        await newAdmin.save()

        const html = await emailTemplate(
            `${newAdmin.firstName} ${newAdmin.lastName}`,
              newAdmin.otp,
            );
            await sendEmail(newAdmin.email, "Verify Admin Email", html)

            res.status(201).json({
            message:"Admin created successfully, otp has been sent to email",
            data: newAdmin
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Something went Wrong",
            error: error.message
        })
    }
}
exports.verifyAdminEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const existingAdmin = await admin.findOne({ email: email.toLowerCase() });

    if (!existingAdmin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (Date.now() > existingAdmin.otpExpires) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    if (existingAdmin.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP credentials",
      });
    }
    existingAdmin.isVerified = true

    await existingAdmin.save()
    res.status(200).json({
        message:'OTP Verified successfully'
      })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const existingAdmin = await admin.findOne({ email: email.toLowerCase() });

    if (!existingAdmin) {
      return res.status(404).json({
        message: "Invalid Credentials",
      });
    }

    if (!existingAdmin.password) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const correctPassword = await bcrypt.compare(password, existingAdmin.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!existingAdmin.isVerified) {
      return res.status(400).json({
        message: "Please verify your email",
      });
    }

    const token = jwt.sign(
      { id: existingAdmin._id, role: existingAdmin.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login Successful",
      admin: existingAdmin,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};
exports.adminforgotPassowrd = async (req, res) => {
  try{
    const {email} = req.body
    if(!email){
      return res.status(400).json({
        message:"Email is required"
      })
    }
    const existingAdmin = await admin.findOne({email:email.trim().toLowerCase()})
    if(!existingAdmin){
      return res.status(400).json({
        message:"Admin not found"
      })
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    existingAdmin.otp = otp
    existingAdmin.otpExpires = Date.now() + (1000 * 60 * 7)

    await existingAdmin.save()
    const html = await resetPasswordTemplate(
      `${existingAdmin.firstName} ${existingAdmin.lastName}`,
        otp,
      );
      await sendEmail(existingAdmin.email, "Reset Passowrd OTP", html)
      res.status(200).json({
        message:"OTP sent to email"
      })
  }catch(error){
    console.log(error)
    res.status(500).json({
      message:"Something went wrong"
    })
  }
}
exports.resetAdminPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({
        message: "Email, OTP and New password are required",
      });
    }

    const existingAdmin = await admin.findOne({ email: email.toLowerCase() });

    if (!existingAdmin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (Date.now() > existingAdmin.otpExpires) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    if (existingAdmin.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP credentials",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    existingAdmin.password = hashPassword;
    await existingAdmin.save();

    const html = await resetPasswordSuccessfulTemplate(
      `${existingAdmin.firstName} ${existingAdmin.lastName}`,
    );
    await sendEmail(existingAdmin.email, "Password Reset Successfully", html);
    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in reset password",
      error: error.message,
    });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }
    const existingAdmin = await admin.findById(id);

    if (!existingAdmin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }
    const correctPassword = await bcrypt.compare(oldPassword, existingAdmin.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: "Incorrect Password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    existingAdmin.password = hashPassword;
    await existingAdmin.save();
    
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in change password",
      error: error.message,
    });
  }
};
exports.getOneUser = async (req, res) =>{
    try{
        const id = req.params.id
        const existingUser = await userModel.findById(id)

        if(!existingUser){
            return res.status(404).json({
                message:"User not found"
            })
        }
        res.status(200).json({
            message:"User found successfully",
            data: existingUser
        })
    }catch(error){
        res.status(500).json({
            message:"Something went wrong",
            error: error.message
        })
    }
}
exports.getAlluser = async (req, res) =>{
  try {
    const users = await userModel.find().select('-password')

    res.status(200).json({
      message:'Found all users',
      count:user.length,
      users
    })
  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
}
exports.getAllPayment = async (req, res) => {
  try {
    const payments = await paymentModel.find()

    res.status(200).json({
      message:'All Payment Gotten Succesfully',
      count: payment.length,
      payments
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
exports.getAllTransactions = async (req, res) =>{
  try {
    const transaction = await transactionModel.find()

    res.status(200).json({
      message:'All Transactions Found',
      count: transaction.length,
      transaction,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
exports.getAllRevenue = async (req, res) =>{
  try {
    const transaction = await revenueModel.find()

    res.status(200).json({
      message:'All Revenue Found',
      count: transaction.length,
      transaction,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}





