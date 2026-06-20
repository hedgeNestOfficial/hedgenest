const { creditWallet } = require("../utils/creditWallet")

exports.creditMiddleware = async(req, res, next) => {
    try {
        await creditWallet();
        next();
    } catch (error) {
        res.status(500).json({
            message: "Middleware: Error crediting wallet."
        })
    }
}