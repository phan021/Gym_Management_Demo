const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'gym_app',
  password: process.env.DB_PASSWORD || 'GymAppPassword123!',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'QuanLyPhongGym',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    try {
      pool = await new sql.ConnectionPool(config).connect();
      console.log('✅ Đã kết nối cơ sở dữ liệu QuanLyPhongGym thành công!');
    } catch (err) {
      console.error('❌ Kết nối database thất bại:', err.message);
      throw err;
    }
  }
  return pool;
};

// Khởi tạo kết nối ngay khi app nạp
const poolPromise = getPool();

module.exports = {
  sql,
  poolPromise,
  getPool
};
