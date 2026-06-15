const router = require('express').Router()

const { conversion, liveRate } = require('../controller/conversion')
const { Authentication } = require('../middleware/auth')
const { conversionValidator } = require('../middleware/validators')


router.get('/liveRate', liveRate )
router.post('/convert', Authentication, conversionValidator, conversion )

module.exports = router