const investmentPlanModel = require('../model/investmentPlan')

exports.createInvestmentPlan = async (req, res) => {
    const { investmentName, roi, term, minAmount } = req.body
    const plan = await investmentPlanModel.create({
        investmentName,
        roi,
        term,
        minAmount
    });

  res.status(201).json({
    message: "Plan created successfully",
    data: plan
  });
};

exports.getAllinvestmentPlan = async (req, res) => {
  try {
    const investmentPlan = await investmentPlanModel.find()
    res.status(200).json({
        message: 'All investment plans successfully retrieved',
        investmentPlan
      })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}