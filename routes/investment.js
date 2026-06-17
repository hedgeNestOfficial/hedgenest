const router = require('express').Router()

const { createInvestment, getOneInvestment, myInvestments, claimInvestment, completeInvestment, breakInvestment, } = require('../controller/investment')
const { Authentication } = require('../middleware/auth');
const { createInvestmentValidator, getOneInvestmentValidator, compInvestmentValidator, claimInvestmentValidator, breakInvestmentValidator } = require('../middleware/validators');

router.post('/initiateInvestment', Authentication, createInvestmentValidator, createInvestment)
router.get('/investment', Authentication, myInvestments);
router.get('/oneInvestment/:investmentId', Authentication, getOneInvestment);
router.put('/compInvestment', Authentication, compInvestmentValidator, completeInvestment);
router.put('/claimInvestment', Authentication, claimInvestmentValidator, claimInvestment);
router.put('/breakInvestment/:investmentId', Authentication, breakInvestmentValidator, breakInvestment);

module.exports = router  