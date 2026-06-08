const router = require('express').Router()

const { converionToUsdt } = require('../controller/conversion')
const { Authentication } = require('../middleware/auth')


router.post('/convert', Authentication, converionToUsdt )

module.exports = router