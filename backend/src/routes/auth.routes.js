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



module.exports=router