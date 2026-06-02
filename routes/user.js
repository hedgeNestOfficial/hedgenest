const router = require ('express').Router()
const {createUser, verifyEmail, login, forgotPassword, resetPassword, changePassword, loginWithGoogle, createTransactionPin, update, resend} = require('../controller/user')
const {Authentication} = require('../middleware/auth')
// const {profile, loginProfile} = require('../middleware/passport')
const {resetPasswordValidator, changePasswordValidator,signUpValidator, transactionPinValidator} = require('../middleware/validators')

router.post('/create-user', signUpValidator, createUser)
router.patch('/create-pin', transactionPinValidator, createTransactionPin)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPasswordValidator, resetPassword)
router.post('/change-password', Authentication, changePasswordValidator, changePassword)
router.post('/verify/check', verifyEmail)
router.put('/update', Authentication, update)
router.post('/resend', resend)

// router.get('/auth/google', profile)
// router.get('/auth/google/callback', loginProfile,loginWithGoogle)


module.exports = router