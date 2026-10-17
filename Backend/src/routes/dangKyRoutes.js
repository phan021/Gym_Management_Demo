const express = require('express');
const router = express.Router();
const dangKyController = require('../controllers/dangKyController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Route cho hội viên
router.get('/my-dang-ky', verifyToken, dangKyController.getMyDangKy);
router.post('/member-register', verifyToken, (req, res, next) => {
  // Gán maHV từ session nếu hội viên tự đăng ký
  if (req.user && req.user.maHV) {
    req.body.maHV = req.user.maHV;
  }
  dangKyController.createDangKy(req, res, next);
});

// Route hủy gói (hội viên hoặc quản trị)
router.put('/:id/cancel', verifyToken, dangKyController.cancelDangKy);

// Route quản trị
router.get('/', verifyToken, requireAdmin, dangKyController.getAllDangKy);
router.get('/:id', verifyToken, requireAdmin, dangKyController.getDangKyById);
router.post('/', verifyToken, requireAdmin, dangKyController.createDangKy);
router.put('/:id', verifyToken, requireAdmin, dangKyController.updateDangKy);
router.delete('/:id', verifyToken, requireAdmin, dangKyController.deleteDangKy);

module.exports = router;
