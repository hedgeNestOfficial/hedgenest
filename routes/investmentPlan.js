const router = require('express').Router()

const { createInvestmentPlan, getAllinvestmentPlan } = require('../controller/investmentPlan')
const { adminAuth, Authentication } = require('../middleware/auth')

router.post('/', Authentication, createInvestmentPlan)
router.get('/', Authentication, getAllinvestmentPlan)

module.exports = router