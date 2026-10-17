const express = require('express');
const router = express.Router();
const hoiVienController = require('../controllers/hoiVienController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Route cho hội viên tự xem và sửa thông tin
router.get('/my-profile', verifyToken, hoiVienController.getMyProfile);
router.put('/my-profile', verifyToken, hoiVienController.updateMyProfile);

// Route quản lý cho Admin / Nhân viên
router.get('/', verifyToken, requireAdmin, hoiVienController.getAllHoiVien);
router.get('/:id', verifyToken, requireAdmin, hoiVienController.getHoiVienById);
router.post('/', verifyToken, requireAdmin, hoiVienController.createHoiVien);
router.put('/:id', verifyToken, requireAdmin, hoiVienController.updateHoiVien);
router.delete('/:id', verifyToken, requireAdmin, hoiVienController.deleteHoiVien);

module.exports = router;
