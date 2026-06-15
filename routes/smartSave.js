const router = require ('express').Router()
const {previewPlan, createPlan, breakPlan, topUpFlexible, getAllPlan, getOnePlan} = require ('../controller/smartSave')
const {Authentication} = require ('../middleware/auth')
const{createPlanValidator} = require('../middleware/validators')

router.get('/preview-plan', Authentication, previewPlan);
router.post('/create-plan', Authentication, createPlanValidator,  createPlan)
router.post('/break-plan/:planId', Authentication, breakPlan)
router.post('/top-up/:savingId', Authentication, topUpFlexible)

router.get('/get-all-plan',Authentication, getAllPlan)
router.get('/get-one-plan/:id',Authentication,  getOnePlan)

module.exports = router
