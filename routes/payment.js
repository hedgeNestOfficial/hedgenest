const router = require('express').Router()
const { initiatePayment, verifyPayment, verifyWebhook } = require('../controller/payment')
const { Authentication } = require('../middleware/auth')
const { initiatePaymentValidator } = require('../middleware/validators')

router.post('/fundWallet', Authentication, initiatePaymentValidator, initiatePayment)
router.get('/verifyFund', Authentication, verifyPayment)
router.post('/verifyPayment', Authentication, verifyWebhook)


module.exports = router
