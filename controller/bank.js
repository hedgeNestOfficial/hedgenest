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

