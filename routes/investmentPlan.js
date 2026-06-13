const router = require('express').Router()

const { createInvestmentPlan, getAllinvestmentPlan } = require('../controller/investmentPlan')
const { adminAuth, Authentication } = require('../middleware/auth')

router.post('/investmentPlan', Authentication, createInvestmentPlan)
router.get('/allInvestmentPlan', Authentication, getAllinvestmentPlan)

module.exports = router