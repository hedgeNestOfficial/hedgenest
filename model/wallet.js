   const mongoose = require('mongoose');

   const walletSchema = new mongoose.Schema({
      userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
      },
      availableBalance: {
      type:  Number,
      default: 0
      },
      balanceInNaira:{
      type:  Number,
      default: 0
      },
      balanceInUSDT: {
      type:  Number,
      default: 0
      },
      smartVaults: {
      type:  Number,
      default: 0
      },
      investments: {
      type:  Number,
      default: 0
      },
   }, {timestamps: true})

   const walletModel = mongoose.model('wallets', walletSchema)

   module.exports = walletModel
