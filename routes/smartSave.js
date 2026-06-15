const router = require ('express').Router()
const {previewPlan, createPlan, breakPlan} = require ('../controller/smartSave')
const {Authentication} = require ('../middleware/auth')
const{createPlanValidator} = require('../middleware/validators')

router.post('/preview-plan', Authentication, previewPlan);
router.post('/create-plan', Authentication, createPlanValidator,  createPlan)
router.post('/break-plan/:planId', Authentication, breakPlan)
router.post('/top-up', )

module.exports = router
