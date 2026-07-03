const express=require('express')


const router=express.Router()

const authController=require('../controllers/auth.controllers.js')

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

router.post("/forget-password",authController.forgetPasswordController)
router.post("/verify-otp",authController.verifyOtpController)
router.post("/reset-password",authController.resetPasswordController)

module.exports=router