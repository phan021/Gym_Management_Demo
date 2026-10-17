const express = require('express');
const router = express.Router();
const goiTapController = require('../controllers/goiTapController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Xem danh sách gói tập (Hội viên & Admin đều xem được)
router.get('/', verifyToken, goiTapController.getAllGoiTap);
router.get('/:id', verifyToken, goiTapController.getGoiTapById);

// Thêm, sửa, xóa (chỉ Admin / Nhân viên)
router.post('/', verifyToken, requireAdmin, goiTapController.createGoiTap);
router.put('/:id', verifyToken, requireAdmin, goiTapController.updateGoiTap);
router.delete('/:id', verifyToken, requireAdmin, goiTapController.deleteGoiTap);

module.exports = router;
