const express=require('express')


const router=express.Router()

const authController=require('../controllers/auth.controllers.js')
const authMiddleware = require('../middleware/auth.middleware.js')
/**
 * POST: /api/auth/register
 * @description:Register a new user
 */
router.post("/register",authController.userRegisterController)


/**
 * POST:/api/auth.login
 * @description:Login user
 */

router.post("/login",authController.userLoginController)

/**
 * POST:/api/auth/logout
 * @description:Logout user by blacklisting the token
 */

router.post("/logout",authController.userLogoutController)

router.post("/forget-password",authController.forgetPassword)
router.post("/verify-otp",authController.verifyOtp)
router.post("/reset-password",authController.resetPassword)
router.get("/me", authMiddleware.authMiddleware, authController.getMe)

module.exports=router