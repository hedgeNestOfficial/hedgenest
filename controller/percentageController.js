const savingsPercentage = require ('../model/savingsPercent')

exports.createPercentage = async (req, res)=>{
    try {
        const {values} = req.body;
        const percentages = await savingsPercentage.insertMany(values);
        res.status(200).json({
            message:'Got All Values',
            data: percentages
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}