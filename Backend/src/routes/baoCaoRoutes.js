const express = require('express');
const router = express.Router();
const baoCaoController = require('../controllers/baoCaoController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/tong-quan', verifyToken, requireAdmin, baoCaoController.getTongQuan);
router.get('/doanh-thu-thang', verifyToken, requireAdmin, baoCaoController.getDoanhThuTheoThang);
router.get('/doanh-thu-12-thang', verifyToken, requireAdmin, baoCaoController.getDoanhThu12Thang);
router.get('/thong-ke-goi-tap', verifyToken, requireAdmin, baoCaoController.getThongKeGoiTap);

module.exports = router;
