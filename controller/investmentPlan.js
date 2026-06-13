const investmentPlanModel = require('../model/investmentPlan')
const redis = require('redis')

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
    const checkCache = await redis.get('investmentPlan')
    console.log(checkCache)
    if(checkCache){
      return res.status(200).json({
        message: 'successfully retrieved all users',
        data: JSON.parse(checkCache)
      })
    }

    const investmentPlans = await investmentPlanModel.find()
    redis.set('investmentPlan', JSON.stringify(investmentPlan), 'EX', 60)
    res.status(200).json({
      message: 'All investment plans successfully retrieved',
      data: investmentPlans
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}