const express = require('express');
const router = express.Router();
const thanhToanController = require('../controllers/thanhToanController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Route cho hội viên
router.get('/my-thanh-toan', verifyToken, thanhToanController.getMyThanhToan);

// Route quản trị
router.get('/', verifyToken, requireAdmin, thanhToanController.getAllThanhToan);
router.get('/:id', verifyToken, requireAdmin, thanhToanController.getThanhToanById);
router.post('/', verifyToken, requireAdmin, thanhToanController.createThanhToan);
router.put('/:id', verifyToken, requireAdmin, thanhToanController.updateThanhToan);
router.delete('/:id', verifyToken, requireAdmin, thanhToanController.deleteThanhToan);

module.exports = router;
