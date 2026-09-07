const { Router } = require('express');
const router = Router();
const { authMiddleware, authSystemUserMiddleware } = require('../middleware/auth.middleware.js');
const depositController = require('../controllers/depositRequest.controller.js');

// User routes
router.post('/', authMiddleware, depositController.createDepositRequest);
router.get('/my', authMiddleware, depositController.getMyDepositRequests);

// Admin / System User routes
router.get('/pending', authSystemUserMiddleware, depositController.getPendingDepositRequests);
router.get('/approved', authSystemUserMiddleware, depositController.getApprovedDepositRequests); // 👈 New
router.get('/rejected', authSystemUserMiddleware, depositController.getRejectedDepositRequests); // 👈 New

// Admin Action routes
router.post('/:requestId/approve', authSystemUserMiddleware, depositController.approveDepositRequest);
router.post('/:requestId/reject', authSystemUserMiddleware, depositController.rejectDepositRequest);

module.exports = router;