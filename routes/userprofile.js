const router = require('express').Router()
const {getUserProfile, createUserProfile} = require('../controller/userProfile')
const {Authentication} = require('../middleware/auth')

router.post('/create-profile', Authentication, createUserProfile)
router.get('/profile', Authentication, getUserProfile)

module.exports = router