const router = require('express').Router()

const { conversion } = require('../controller/conversion')
const { Authentication } = require('../middleware/auth')
const { conversionValidator } = require('../middleware/validators')


router.post('/convert', Authentication, conversionValidator, conversion )

module.exports = router