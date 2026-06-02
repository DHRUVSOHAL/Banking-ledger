const {Router}=require('express')

const transectionController=require('../controllers/transection.controllers.js')

const authMiddleware=require('../middleware/auth.middleware.js')
const transectionRoutes=Router();

/**
 * @rout POST-/api/transections/
 * @description-create new transection
 */

transectionRoutes.post('/',authMiddleware.authMiddleware,transectionController.createTransection)


/**
 * POST-/api/transection/initial-funds
 * @description-create initial fund transection for new accounts
 */

transectionRoutes.post('/system/initial-funds',authMiddleware.authSystemUserMiddleware,transectionController.createInitialFundsTransection)



module.exports=transectionRoutes