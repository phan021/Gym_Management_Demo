const { getPool, sql } = require('../config/database');

// Lấy danh sách check-in
const getAllCheckIn = async (req, res, next) => {
  try {
    const { dangTap, ngay, search, maHV } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        ci.MaCheckIn,
        ci.MaHV,
        hv.HoTen as TenHoiVien,
        hv.SoDienThoai as SdtHoiVien,
        ci.ThoiGianVao,
        ci.ThoiGianRa,
        DATEDIFF(MINUTE, ci.ThoiGianVao, COALESCE(ci.ThoiGianRa, GETDATE())) as SoPhutTap
      FROM CheckIn ci
      JOIN HoiVien hv ON ci.MaHV = hv.MaHV
      WHERE 1=1
    `;

    const request = pool.request();

    if (maHV) {
      query += ` AND ci.MaHV = @MaHV`;
      request.input('MaHV', sql.Int, maHV);
    }

    if (dangTap === 'true') {
      query += ` AND ci.ThoiGianRa IS NULL`;
    }

    if (ngay) {
      query += ` AND CAST(ci.ThoiGianVao AS DATE) = @Ngay`;
      request.input('Ngay', sql.Date, ngay);
    }

    if (search) {
      query += ` AND (hv.HoTen LIKE @Search OR hv.SoDienThoai LIKE @Search)`;
      request.input('Search', sql.NVarChar(100), `%${search}%`);
    }

    query += ` ORDER BY ci.ThoiGianVao DESC`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Thực hiện Check-in (gọi Stored Procedure sp_CheckInHoiVien)
const createCheckIn = async (req, res, next) => {
  try {
    const { maHV } = req.body;

    if (!maHV) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn hoặc nhập mã hội viên' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('MaHV', sql.Int, maHV)
      .execute('sp_CheckInHoiVien');

    res.status(201).json({
      success: true,
      message: result.recordset[0]?.ThongBao || 'Check-in thành công',
      data: { maCheckIn: result.recordset[0]?.MaCheckInMoi }
    });
  } catch (error) {
    next(error);
  }
};

// Check-out (Ghi nhận giờ ra)
const checkOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const checkRecord = await pool.request()
      .input('MaCheckIn', sql.Int, id)
      .query(`SELECT ThoiGianRa FROM CheckIn WHERE MaCheckIn = @MaCheckIn`);

    if (checkRecord.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lượt check-in' });
    }

    if (checkRecord.recordset[0].ThoiGianRa) {
      return res.status(400).json({ success: false, message: 'Lượt tập này đã được check-out trước đó' });
    }

    await pool.request()
      .input('MaCheckIn', sql.Int, id)
      .query(`UPDATE CheckIn SET ThoiGianRa = GETDATE() WHERE MaCheckIn = @MaCheckIn`);

    res.json({ success: true, message: 'Check-out thành công' });
  } catch (error) {
    next(error);
  }
};

// Sửa bản ghi Check-in
const updateCheckIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { thoiGianVao, thoiGianRa } = req.body;

    const pool = await getPool();

    await pool.request()
      .input('MaCheckIn', sql.Int, id)
      .input('ThoiGianVao', sql.DateTime, thoiGianVao)
      .input('ThoiGianRa', sql.DateTime, thoiGianRa || null)
      .query(`
        UPDATE CheckIn
        SET ThoiGianVao = @ThoiGianVao,
            ThoiGianRa = @ThoiGianRa
        WHERE MaCheckIn = @MaCheckIn
      `);

    res.json({ success: true, message: 'Cập nhật bản ghi check-in thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa bản ghi check-in
const deleteCheckIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('MaCheckIn', sql.Int, id)
      .query(`DELETE FROM CheckIn WHERE MaCheckIn = @MaCheckIn`);

    res.json({ success: true, message: 'Xóa bản ghi check-in thành công' });
  } catch (error) {
    next(error);
  }
};

// Hội viên xem lịch sử check-in của chính mình
const getMyCheckIn = async (req, res, next) => {
  try {
    const maHV = req.user.maHV;
    if (!maHV) {
      return res.status(404).json({ success: false, message: 'Tài khoản chưa được liên kết với hội viên' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('MaHV', sql.Int, maHV)
      .query(`
        SELECT 
          MaCheckIn,
          ThoiGianVao,
          ThoiGianRa,
          DATEDIFF(MINUTE, ThoiGianVao, COALESCE(ThoiGianRa, GETDATE())) as SoPhutTap
        FROM CheckIn
        WHERE MaHV = @MaHV
        ORDER BY ThoiGianVao DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCheckIn,
  createCheckIn,
  checkOut,
  updateCheckIn,
  deleteCheckIn,
  getMyCheckIn
};
