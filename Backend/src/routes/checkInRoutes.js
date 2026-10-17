const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Route cho hội viên
router.get('/my-checkin', verifyToken, checkInController.getMyCheckIn);

// Route quản trị
router.get('/', verifyToken, requireAdmin, checkInController.getAllCheckIn);
router.post('/', verifyToken, requireAdmin, checkInController.createCheckIn);
router.put('/:id/checkout', verifyToken, requireAdmin, checkInController.checkOut);
router.put('/:id', verifyToken, requireAdmin, checkInController.updateCheckIn);
router.delete('/:id', verifyToken, requireAdmin, checkInController.deleteCheckIn);

module.exports = router;
