const smartSaveModel = require("../model/smartSave");
const walletModel = require("../model/wallet");

exports.creditWallet = async () => {
  try {
    const now = new Date();

    // Only ACTIVE plans with a maturityDate that has already passed
    // (FLEXIBLE plans have maturityDate: null, so they're naturally excluded)
    const maturedPlans = await smartSaveModel.find({
      status: "ACTIVE",
      maturityDate: { $ne: null, $lte: now },
    });

    if (maturedPlans.length === 0) {
      // console.log("Smart savings: No matured plans to credit");
      return;
    }

    for (const plan of maturedPlans) {
      const wallet = await walletModel.findOne({ userId: plan.userId });

      if (!wallet) {
        console.log(
          `Smart savings: Wallet not found for user ${plan.userId}, skipping plan ${plan._id}`,
        );
        continue;
      }

      const creditAmount = plan.totalPayback;

      // Credit the matured amount (principal + interest) back into the wallet
      wallet.availableBalance += creditAmount;

      // Remove one completed plan from the smart vault count
      wallet.smartVaults = Math.max(
        0,
        (wallet.smartVaults || 0) - 1,
      );

      await wallet.save();

      // Close the plan
      plan.status = "COMPLETED";
      await plan.save();

      console.log(
        `Smart savings: Credited NGN ${creditAmount} to user ${plan.userId}, closed plan ${plan._id}`,
      );
    }
  } catch (error) {
    throw new Error("Smart savings: Error crediting wallet", error);
  }
};

