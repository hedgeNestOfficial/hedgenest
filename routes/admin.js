const router = require ('express').Router()
const {createAdmin, adminLogin, verifyAdminEmail, adminforgotPassowrd, getOneUser, changeAdminPassword, resetAdminPassword, getAlluser, getAllPayment, getAllTransactions, getAllRevenue, getAllSavings, getAllInvestment} = require('../controller/admin')
const {Authentication, adminAuth} = require('../middleware/auth')
const{signUpValidator, resetPasswordValidator,changePasswordValidator} = require('../middleware/validators')

router.post('/create-admin',signUpValidator, createAdmin)
router.post('/login-admin', adminLogin)
router.post('/verify-admin', verifyAdminEmail)
router.post('/forgot-admin-password', adminforgotPassowrd)
router.post('/reset-admin-password',resetPasswordValidator, resetAdminPassword)
router.post('/change-admin-password', Authentication, adminAuth, changePasswordValidator, changeAdminPassword)


router.get('/get-One/:id', Authentication, getOneUser)
router.get('/get-all-users', getAlluser)
router.get('/get-all-payments', getAllPayment)
router.get('/get-all-transactions', getAllTransactions)
router.get('/get-all-revenue', getAllRevenue)
router.get('/get-all-saving', getAllSavings)
router.get('/get-all-investment', getAllInvestment)


module.exports = router
