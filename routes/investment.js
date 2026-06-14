const router = require('express').Router()

const { createInvestment, getOneInvestment, myInvestments, claimInvestment, completeInvestment, } = require('../controller/investment')
const { Authentication } = require('../middleware/auth');
const { createInvestmentValidator, getOneInvestmentValidator, compInvestmentValidator, claimInvestmentValidator } = require('../middleware/validators');

router.post('/initiateInvestment', Authentication, createInvestmentValidator, createInvestment)
router.get('/investment/:userId', Authentication, myInvestments);
router.get('/oneInvestment/:investmentId', Authentication, getOneInvestmentValidator, getOneInvestment);
router.put('/compInvestment', Authentication, compInvestmentValidator, completeInvestment);
router.put('/claimInvestment', Authentication, claimInvestmentValidator, claimInvestment);

module.exports = router  