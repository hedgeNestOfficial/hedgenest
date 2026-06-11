const router = require('express').Router()
const { uploadUtility, kyc1Verification } = require('../controller/kyc')
const { Authentication } = require('../middleware/auth')
const upload = require('../middleware/multer');
const {kycValidator} = require('../middleware/validators')


router.post('/verify',Authentication, kycValidator, kyc1Verification)
router.put('/uploadUtilityBill', Authentication, upload.single('utilityBill'), uploadUtility)
module.exports = router
