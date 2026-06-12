require("dotenv").config();
const userModel = require("../model/user");
const adminModel = require("../model/admin");
const walletModel = require("../model/wallet");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/brevo");
const {emailTemplate,resetPasswordTemplate,resetPasswordSuccessfulTemplate,transactionPinTemplate,} = require("../email");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;
    const existingUser = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exist",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/dkyrqc1vp/image/upload/v1780326484/images_jedg8v.jpg",
      {
        folder: "profile-picture",
      },
    );

    const profilePicture = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

    const user = new userModel({
      firstName,
      lastName,
      phoneNumber,
      email: email.toLowerCase(),
      password: hashPassword,
      otp,
      otpExpires: Date.now() + (1000 * 60 * 7),
      profilePicture,
    });

    await user.save();

    const existingWallet = await walletModel.findOne({ userId: user._id });

    if (!existingWallet) {
      await walletModel.create({
        userId: user._id,
      });
    }

    const html = await emailTemplate(
      `${user.firstName} ${user.lastName}`,
      user.otp,
    );
    await sendEmail(user.email, "Verify Email", html);

    res.status(200).json({
      status: true,
      message: "User created successfully, otp has been sent to email",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({
        status: false,
        message: "OTP Expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP credentials",
      });
    }
    user.isVerified = true
    await user.save()
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        message: "Invalid Credentials",
      });
    }
    const wallet = await walletModel.findOne({userId: user._id});
       if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found",
      });
    }
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login Successful",
      user,
      wallet,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({
        status: false,
        message: "Email is required",
      });
    }
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      const user = await adminModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false,specialChars: false,});
      user.otp = otp
      admin.otpExpires = Date.now() + (1000 * 60 * 7)

      await user.save();
      const html = await resetPasswordTemplate(
        `${admin.firstName} ${admin.lastName}`,
        otp,
      );
      await sendEmail(user.email, "Reset Password", html);
      return res.status(200).json({
        message: "OTP sent to email"
      });
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false,specialChars: false,});
    user.otp = otp
    user.otpExpires = Date.now() + (1000 * 60 * 7)

    await user.save();
    const html = await resetPasswordTemplate(
      `${user.firstName} ${user.lastName}`,
      otp,
    );
    await sendEmail(user.email, "Reset Password", html);
    res.status(200).json({
      message: "OTP sent to email"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in forgot password",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and New password are required",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if ( Date.now() > user.otpExpires || user.otp !== otp ){
      return res.status(400).json({
        message:'Invalid OTP'
      })
    }

    if (user.otp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP"
    });
  }
  
  if (user.otpExpires < Date.now()) {
    return res.status(400).json({
      message: "OTP has expired"
    });
  }
  user.otp = null;
  user.otpExpires = null;
  user.isVerified = true;
  
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashPassword;
  await user.save();
  const html = await resetPasswordSuccessfulTemplate(
    `${user.firstName} ${user.lastName}`,
    otp,
    );
    await sendEmail(user.email, "Password Reset Successfully", html);

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

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Old password and new password are required",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const correctPassword = await bcrypt.compare(oldPassword, user.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: "Incorrect Password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashPassword;
    await user.save();
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

exports.createTransactionPin = async (req, res) => {
  try {
    const { transactionPin, email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPin = await bcrypt.hash(transactionPin, salt);
    user.transactionPin = hashPin;
    await user.save();
    const token = await jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      status: true,
      message: "Transaction pin created successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.update = async (req, res) => {
  let uploadResult;

  try {
    const file = req.file;
    const { phoneNumber, profilePicture } = req.body;
    const { id } = req.user;
    const user = await userModel.findById(id);

    if (!user) {
      if (file?.path) fs.unlinkSync(file.path);
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }

    if (file && file.path) {
      if (user.profilePicture?.publicId) {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      }

      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "profile-picture",
      });

      fs.unlinkSync(file.path);
    }

    const newUpdate = await userModel.findByIdAndUpdate(id, {phoneNumber, profilePicture:profilePicture}, {new: true
        })
        res.status(201).json({
            message: "User profile updated successfully",
            data: newUpdate
        })

  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};
exports.resend = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false,specialChars: false,});
    user.otp = otp
    user.otpExpires = Date.now() + (1000 * 60 * 7)

    const html = await transactionPinTemplate(
      `${user.firstName} ${user.lastName}`,
      otp,
    );
    await sendEmail(user.email, "Verify Email", html);

    await user.save();

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};
exports.changePin = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldTransactionPin, newTransactionPin, confirmTransactionPin } =
      req.body;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPin = await bcrypt.hash(newTransactionPin, salt);
    user.transactionPin = hashPin;
    await user.save();
    res.status(200).json({
      message: "Transaction pin changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in change password",
      error: error.message,
    });
  }
};
