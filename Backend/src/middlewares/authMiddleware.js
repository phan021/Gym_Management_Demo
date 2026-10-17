const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gym_super_secret_jwt_key_2026_quanlyphonggym';

// Xác thực JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Vui lòng cung cấp token đăng nhập (Authorization header)' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    req.user = decoded; // { maTK, tenDangNhap, vaiTro, maHV, hoTen }
    next();
  });
};

// Yêu cầu quyền ADMIN hoặc NHANVIEN
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.vaiTro !== 'ADMIN' && req.user.vaiTro !== 'NHANVIEN')) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng quản trị này' });
  }
  next();
};

// Yêu cầu quyền HOIVIEN
const requireMember = (req, res, next) => {
  if (!req.user || req.user.vaiTro !== 'HOIVIEN') {
    return res.status(403).json({ success: false, message: 'Chức năng chỉ dành cho hội viên' });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireMember,
  JWT_SECRET
};
