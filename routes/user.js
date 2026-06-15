const router = require ('express').Router()
const {createUser, verifyEmail, login, forgotPassword, resetPassword, changePassword, loginWithGoogle, createTransactionPin, update, changePin, resend, logout, myWallet} = require('../controller/user')
const {Authentication} = require('../middleware/auth')
const {profile, loginProfile} = require('../middleware/passport')
const {resetPasswordValidator, changePasswordValidator,signUpValidator, changeTransactionPinValidator, createTransactionPinValidator, resendOtpValidator, updateValidator} = require('../middleware/validators')
const upload = require('../middleware/multer');


router.post('/create-user', signUpValidator, createUser)

router.patch('/create-pin', Authentication, createTransactionPinValidator, createTransactionPin)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPasswordValidator, resetPassword)
router.post('/change-password', Authentication, changePasswordValidator, changePassword)
router.post('/verify/check', verifyEmail)
router.put('/update', Authentication, updateValidator, upload.single('profilePicture'), update)
router.post('/resendOtp', resend)

router.put('/changePin', Authentication, changeTransactionPinValidator, changePin)
router.post('/logout', Authentication, logout)
router.get('/myWallet', Authentication, myWallet)

module.exports = router
