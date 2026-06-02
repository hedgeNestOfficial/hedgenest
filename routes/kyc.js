const router = require('express').Router()
const { uploadKYC, uploadUtility } = require('../controller/kyc')
const { Authentication } = require('../middleware/auth')
const upload = require('../middleware/multer');
const {kycValidator} = require('../middleware/validators')

router.post('/uploadId', Authentication, kycValidator, upload.single('idPhoto'), uploadKYC)
router.put('/uploadUtilityBill', Authentication, upload.single('utilityBill'), uploadUtility)
module.exports = router
