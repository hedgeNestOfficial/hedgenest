const router = require('express').Router()
const { uploadKYC, uploadUtility } = require('../controller/kyc')
const { Authentication } = require('../middleware/auth')
const upload = require('../middleware/multer');

router.post('/uploadId', Authentication, upload.single('idPhoto'), uploadKYC)
router.put('/uploadUtilityBill', Authentication, upload.single('utilityBill'), uploadUtility)
module.exports = router
