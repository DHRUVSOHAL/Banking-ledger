const express=require('express');



const authMiddleware=require('../middleware/auth.middleware.js')

const accountController=require("../controllers/account.controllers.js")

const router=express.Router();

/**
 * @route POST /api/accounts/
 * @description Create a new account for the authenticated user
 * protected route, requires authentication
 */

router.post("/",authMiddleware.authMiddleware,accountController.createAccount)

/**
 * @route GET /api/accounts/
 * @description get all account of logged in user
 */
router.get('/',authMiddleware.authMiddleware,accountController.getAUserAccountsOfUser)















module.exports=router