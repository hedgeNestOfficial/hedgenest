const investmentModel = require('../model/investment');
const walletModel = require('../model/wallet');

exports.createInvestment = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        const wallet = await walletModel.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({
                message: "Wallet not found"
            });
        }

        if (amount > wallet.availableBalance) {
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        if (investmentType === 'nestSafe' && Number(amount) < 5000) {
            return res.status(400).json({
        success: false,
        message: 'Minimum investment amount for NestSafe is ₦5,000'
    });
}else{
        const roi = 14.5;
        const term = 90;

        const expectedReturn =
            Number(amount) + (Number(amount) * roi / 100);

        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + term);

        wallet.availableBalance -= Number(amount);
        }


if (investmentType === 'nestPortfolio' && Number(amount) < 5000) {
            return res.status(400).json({
        success: false,
        message: 'Minimum investment amount for NestPortfolio is ₦6,500'
    });
}else{
        const roi = 16;
        const term = 90;

        const expectedReturn =
            Number(amount) + (Number(amount) * roi / 100);

        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + term);

        wallet.availableBalance -= Number(amount);
        }


        await wallet.save();

        const investment = await investmentModel.create({
            userId,
            amount,
            term,
            roi,
            expectedReturn,
            maturityDate
        });

        res.status(201).json({
            success: true,
            investment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};