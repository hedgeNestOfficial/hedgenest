const router = require ('express').Router()
const { getBankCode, linkBank } = require('../controller/bank')
const {Authentication} = require('../middleware/auth')
const{bankDetailsValidator} = require('../middleware/validators')

router.post('/getCode', Authentication, bankDetailsValidator, linkBank);

module.exports = router