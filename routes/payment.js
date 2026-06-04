const router = require('express').Router()
const { initiatePayment, verifyPayment } = require('../controller/payment')
const { Authentication } = require('../middleware/auth')

router.post('/fundWallet', Authentication, initiatePayment)
router.get('/verifyFund', Authentication, verifyPayment)


module.exports = router