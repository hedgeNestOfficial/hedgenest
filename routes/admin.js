const router = require ('express').Router()
const {createAdmin, adminLogin, verifyAdminEmail, adminforgotPassowrd, getOneUser, changeAdminPassword, resetAdminPassword, getAlluser, getAllPayment, getAllTransactions, getAllRevenue} = require('../controller/admin')
const {Authentication, adminAuth} = require('../middleware/auth')
const{signUpValidator, resetPasswordValidator,changePasswordValidator} = require('../middleware/validators')

router.post('/create-admin',signUpValidator, createAdmin)
router.post('/login-admin', adminLogin)
router.post('/verify-admin', verifyAdminEmail)
router.post('/forgot-admin-password', adminforgotPassowrd)
router.post('/reset-admin-password',resetPasswordValidator, resetAdminPassword)
router.post('/change-admin-password', Authentication, adminAuth, changePasswordValidator, changeAdminPassword)


router.get('/get-One/:id',  Authentication, getOneUser)
router.get('/get-all-users', Authentication, adminAuth, getAlluser)
router.get('/get-all-payments',Authentication, adminAuth, getAllPayment)
router.get('/get-all-transactions', Authentication, adminAuth, getAllTransactions)
router.get('/get-all-revenue',Authentication, adminAuth, getAllRevenue)


module.exports = router
