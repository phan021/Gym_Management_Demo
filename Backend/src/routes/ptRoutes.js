const express = require('express');
const router = express.Router();
const ptController = require('../controllers/ptController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Xem danh sách PT (Cả Admin và Hội viên đều xem được để đặt lịch)
router.get('/', verifyToken, ptController.getAllPT);
router.get('/:id', verifyToken, ptController.getPTById);

// Quản trị viên thêm sửa xóa PT
router.post('/', verifyToken, requireAdmin, ptController.createPT);
router.put('/:id', verifyToken, requireAdmin, ptController.updatePT);
router.delete('/:id', verifyToken, requireAdmin, ptController.deletePT);

module.exports = router;
