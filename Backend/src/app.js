const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Khởi tạo Express
const app = express();

// Middlewares cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Tuyến đường kiểm tra sức khỏe
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Quản Lý Phòng Gym đang hoạt động tốt!',
    timestamp: new Date().toISOString()
  });
});

// Nạp các Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hoi-vien', require('./routes/hoiVienRoutes'));
app.use('/api/goi-tap', require('./routes/goiTapRoutes'));
app.use('/api/pt', require('./routes/ptRoutes'));
app.use('/api/dang-ky', require('./routes/dangKyRoutes'));
app.use('/api/thanh-toan', require('./routes/thanhToanRoutes'));
app.use('/api/check-in', require('./routes/checkInRoutes'));
app.use('/api/lich-pt', require('./routes/lichPTRoutes'));
app.use('/api/bao-cao', require('./routes/baoCaoRoutes'));

// 404 Route Not Found
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}` });
});

// Middleware xử lý lỗi
app.use(errorHandler);

module.exports = app;
