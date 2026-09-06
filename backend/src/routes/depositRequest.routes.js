const { Router } = require('express');
const router = Router();
const { authMiddleware, authSystemUserMiddleware } = require('../middleware/auth.middleware.js');
const depositController = require('../controllers/depositRequest.controller.js');

router.post('/', authMiddleware, depositController.createDepositRequest);
router.get('/my', authMiddleware, depositController.getMyDepositRequests);

router.get('/pending', authSystemUserMiddleware, depositController.getPendingDepositRequests);
router.post('/:requestId/approve', authSystemUserMiddleware, depositController.approveDepositRequest);
router.post('/:requestId/reject', authSystemUserMiddleware, depositController.rejectDepositRequest);

module.exports = router;