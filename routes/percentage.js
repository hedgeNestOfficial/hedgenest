const { createPercentage } = require('../controller/percentageController')

const router = require ('express').Router()

router.post('/percentages', createPercentage)


module.exports = router
