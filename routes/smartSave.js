const router = require ('express').Router()
const {previewPlan, createPlan, breakPlan} = require ('../controller/smartSave')
const {Authentication} = require ('../middleware/auth')

router.post('/preview-plan', Authentication, previewPlan);
router.post('/create-plan', Authentication, createPlan)
router.post('/break-plan/:planId', Authentication, breakPlan)

module.exports = router
