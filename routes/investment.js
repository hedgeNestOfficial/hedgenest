const router = require('express').Router()

const { createInvestment, getOneInvestment, myInvestments, claimInvestment, } = require('../controller/investment')
const { Authentication } = require('../middleware/auth')

router.post('/initiateInvestment', Authentication, createInvestment)
router.get('/investment/:userId', Authentication, myInvestments);
router.get('/oneInvestment/:investmentId', Authentication, getOneInvestment);
router.post('/claimInvestment', Authentication, claimInvestment);

module.exports = router  