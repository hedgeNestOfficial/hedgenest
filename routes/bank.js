const router = require ('express').Router()
const { linkBank } = require('../controller/bank')
const {Authentication} = require('../middleware/auth')

router.post('/link', Authentication, linkBank);

module.exports = router