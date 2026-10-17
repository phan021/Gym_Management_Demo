const express = require('express');
const router = express.Router();
const lichPTController = require('../controllers/lichPTController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Route cho hội viên
router.get('/my-lich-pt', verifyToken, lichPTController.getMyLichPT);
router.post('/member-book', verifyToken, lichPTController.memberBookLichPT);
router.put('/my-lich-pt/:id/cancel', verifyToken, lichPTController.memberCancelLichPT);

// Route quản trị
router.get('/', verifyToken, requireAdmin, lichPTController.getAllLichPT);
router.get('/:id', verifyToken, requireAdmin, lichPTController.getLichPTById);
router.post('/', verifyToken, requireAdmin, lichPTController.createLichPT);
router.put('/:id', verifyToken, requireAdmin, lichPTController.updateLichPT);
router.delete('/:id', verifyToken, requireAdmin, lichPTController.deleteLichPT);

module.exports = router;
