const router = require ('express').Router()
const { linkBank } = require('../controller/bank')
const {Authentication} = require('../middleware/auth')
const{bankDetailsValidator} = require('../middleware/validators')

router.post('/linkBank', Authentication, bankDetailsValidator, linkBank);

module.exports = router