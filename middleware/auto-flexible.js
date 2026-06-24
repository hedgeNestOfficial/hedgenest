const { calculateNextAutoSaveDate, runFlexibleAutoSave } = require("../utils/autoSaveFlexible");


exports.flexibleMiddleware = async(req, res, next) => {
    try {
        await calculateNextAutoSaveDate();
        await runFlexibleAutoSave();
        next();
    } catch (error) {
        res.status(500).json({
            message: "Middleware: Error crediting wallet."
        })
    }
}