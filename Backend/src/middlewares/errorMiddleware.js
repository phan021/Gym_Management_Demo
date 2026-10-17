// Xử lý lỗi toàn cục
const errorHandler = (err, req, res, next) => {
  console.error('⚠️ Lỗi hệ thống:', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi trên hệ thống máy chủ',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = {
  errorHandler
};
