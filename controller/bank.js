const userModel = require('../model/user');
const bankModel = require('../model/bank');


exports.linkBank = async (req, res) => {
  try {
    const { id } = req.user
    const { bankName, accountName, accountNumber } = req.body;
    const user = await userModel.findById(id)

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found"
      })
    };

    
    const bank = await bankModel.create({
      userId: user._id,
      currency: "NGN",
      bankName,
      accountName,
      accountNumber
    });

    res.status(200).json({
      status: true,
      message: 'Account linked successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    })
  }
}

const axios = require('axios');


exports.getBankCode = async (req, res) => {
  try {
    const { id } = req.user;
    const { bankName, accountName, accountNumber } = req.body;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Fetch banks from Korapay
    const response = await axios.get(
      'https://api.korapay.com/merchant/api/v1/misc/banks?countryCode=NG',
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`
        }
      }
    );

    const banks = response.data.data;


    const selectedBank = banks.find(
      bank => bank.name.toLowerCase() === bankName.toLowerCase()
    );

    if (!selectedBank) {
      return res.status(400).json({
        success: false,
        message: "Invalid bank name"
      });
    }

    const bank = await bankModel.create({
      userId: user._id,
      bankName,
      bankCode: selectedBank.code,
      accountName,
      accountNumber
    });

    return res.status(200).json({
      success: true,
      message: "Bank code gotten successfully",
      data: bank
    });

  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.linkBank = async (req, res) => {
  try {
    const { id } = req.user;
    const { bankName, bankCode, accountNumber } = req.body;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Resolve account details from Kora
    const { data } = await axios.post(
      'https://api.korapay.com/merchant/api/v1/misc/banks/resolve',
      {
        bank: bankCode,
        account: accountNumber
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`
        }
      }
    );

    if (!data.status) {
      return res.status(400).json({
        status: false,
        message: 'Unable to resolve account'
      });
    }

    const bank = await bankModel.create({
      userId: user._id,
      currency: 'NGN',
      bankName,
      accountName: data.data.account_name,
      accountNumber
    });

    return res.status(201).json({
      status: true,
      message: 'Account linked successfully',
      data: bank
    });

  } catch (error) {
    console.log(error.response?.data || error.message);

    return res.status(500).json({
      message: 'Error linking bank account',
      error: error.message
    });
  }
};