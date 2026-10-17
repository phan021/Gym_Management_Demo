require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Khởi động server sau khi thử kết nối CSDL
const startServer = async () => {
  try {
    await getPool();
    app.listen(PORT, () => {
      console.log(`🚀 Server Quản Lý Phòng Gym đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động server do lỗi kết nối Database:', error.message);
    process.exit(1);
  }
};

startServer();
