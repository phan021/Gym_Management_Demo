const { getPool, sql } = require('../config/database');

// Lấy danh sách lịch tập PT
const getAllLichPT = async (req, res, next) => {
  try {
    const { maPT, maHV, ngayTap, trangThai, search } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        l.MaLich,
        l.MaHV,
        hv.HoTen as TenHoiVien,
        hv.SoDienThoai as SdtHoiVien,
        l.MaPT,
        pt.HoTen as TenPT,
        pt.ChuyenMon,
        pt.SoDienThoai as SdtPT,
        l.NgayTap,
        CONVERT(varchar(5), l.GioBatDau, 108) as GioBatDau,
        CONVERT(varchar(5), l.GioKetThuc, 108) as GioKetThuc,
        l.TrangThai
      FROM LichPT l
      JOIN HoiVien hv ON l.MaHV = hv.MaHV
      JOIN PT pt ON l.MaPT = pt.MaPT
      WHERE 1=1
    `;

    const request = pool.request();

    if (maPT) {
      query += ` AND l.MaPT = @MaPT`;
      request.input('MaPT', sql.Int, maPT);
    }

    if (maHV) {
      query += ` AND l.MaHV = @MaHV`;
      request.input('MaHV', sql.Int, maHV);
    }

    if (ngayTap) {
      query += ` AND l.NgayTap = @NgayTap`;
      request.input('NgayTap', sql.Date, ngayTap);
    }

    if (trangThai) {
      query += ` AND l.TrangThai = @TrangThai`;
      request.input('TrangThai', sql.NVarChar(30), trangThai);
    }

    if (search) {
      query += ` AND (hv.HoTen LIKE @Search OR pt.HoTen LIKE @Search OR pt.ChuyenMon LIKE @Search)`;
      request.input('Search', sql.NVarChar(100), `%${search}%`);
    }

    query += ` ORDER BY l.NgayTap DESC, l.GioBatDau DESC`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Chi tiết lịch PT
const getLichPTById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('MaLich', sql.Int, id)
      .query(`
        SELECT 
          l.MaLich,
          l.MaHV,
          hv.HoTen as TenHoiVien,
          hv.SoDienThoai as SdtHoiVien,
          l.MaPT,
          pt.HoTen as TenPT,
          pt.ChuyenMon,
          l.NgayTap,
          CONVERT(varchar(5), l.GioBatDau, 108) as GioBatDau,
          CONVERT(varchar(5), l.GioKetThuc, 108) as GioKetThuc,
          l.TrangThai
        FROM LichPT l
        JOIN HoiVien hv ON l.MaHV = hv.MaHV
        JOIN PT pt ON l.MaPT = pt.MaPT
        WHERE l.MaLich = @MaLich
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tập PT' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

// Đặt lịch PT (gọi stored procedure sp_DatLichPT)
const createLichPT = async (req, res, next) => {
  try {
    const { maHV, maPT, ngayTap, gioBatDau, gioKetThuc } = req.body;

    if (!maHV || !maPT || !ngayTap || !gioBatDau || !gioKetThuc) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin đặt lịch' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('MaHV', sql.Int, maHV)
      .input('MaPT', sql.Int, maPT)
      .input('NgayTap', sql.Date, ngayTap)
      .input('GioBatDau', sql.VarChar(10), gioBatDau)
      .input('GioKetThuc', sql.VarChar(10), gioKetThuc)
      .execute('sp_DatLichPT');

    res.status(201).json({
      success: true,
      message: result.recordset[0]?.ThongBao || 'Đặt lịch PT thành công',
      data: { maLich: result.recordset[0]?.MaLichMoi }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái hoặc thời gian lịch PT
const updateLichPT = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngayTap, gioBatDau, gioKetThuc, trangThai, maPT } = req.body;

    const pool = await getPool();

    await pool.request()
      .input('MaLich', sql.Int, id)
      .input('NgayTap', sql.Date, ngayTap)
      .input('GioBatDau', sql.VarChar(10), gioBatDau)
      .input('GioKetThuc', sql.VarChar(10), gioKetThuc)
      .input('TrangThai', sql.NVarChar(30), trangThai)
      .input('MaPT', sql.Int, maPT || null)
      .query(`
        UPDATE LichPT
        SET NgayTap = COALESCE(@NgayTap, NgayTap),
            GioBatDau = COALESCE(@GioBatDau, GioBatDau),
            GioKetThuc = COALESCE(@GioKetThuc, GioKetThuc),
            TrangThai = COALESCE(@TrangThai, TrangThai),
            MaPT = COALESCE(@MaPT, MaPT)
        WHERE MaLich = @MaLich
      `);

    res.json({ success: true, message: 'Cập nhật lịch tập PT thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa lịch PT
const deleteLichPT = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('MaLich', sql.Int, id)
      .query(`DELETE FROM LichPT WHERE MaLich = @MaLich`);

    res.json({ success: true, message: 'Xóa lịch tập PT thành công' });
  } catch (error) {
    next(error);
  }
};

// Dành cho Hội viên: Xem lịch PT của mình
const getMyLichPT = async (req, res, next) => {
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
          l.MaLich,
          l.MaHV,
          l.MaPT,
          pt.HoTen as TenPT,
          pt.ChuyenMon,
          pt.SoDienThoai as SdtPT,
          pt.Email as EmailPT,
          l.NgayTap,
          CONVERT(varchar(5), l.GioBatDau, 108) as GioBatDau,
          CONVERT(varchar(5), l.GioKetThuc, 108) as GioKetThuc,
          l.TrangThai
        FROM LichPT l
        JOIN PT pt ON l.MaPT = pt.MaPT
        WHERE l.MaHV = @MaHV
        ORDER BY l.NgayTap DESC, l.GioBatDau DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Dành cho Hội viên: Tự đặt lịch PT
const memberBookLichPT = async (req, res, next) => {
  try {
    const maHV = req.user.maHV;
    if (!maHV) {
      return res.status(404).json({ success: false, message: 'Tài khoản chưa được liên kết với hội viên' });
    }

    const { maPT, ngayTap, gioBatDau, gioKetThuc } = req.body;

    if (!maPT || !ngayTap || !gioBatDau || !gioKetThuc) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ ngày giờ và chọn PT' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('MaHV', sql.Int, maHV)
      .input('MaPT', sql.Int, maPT)
      .input('NgayTap', sql.Date, ngayTap)
      .input('GioBatDau', sql.VarChar(10), gioBatDau)
      .input('GioKetThuc', sql.VarChar(10), gioKetThuc)
      .execute('sp_DatLichPT');

    res.status(201).json({
      success: true,
      message: result.recordset[0]?.ThongBao || 'Đặt lịch PT thành công',
      data: { maLich: result.recordset[0]?.MaLichMoi }
    });
  } catch (error) {
    next(error);
  }
};

// Hội viên tự hủy lịch hẹn
const memberCancelLichPT = async (req, res, next) => {
  try {
    const maHV = req.user.maHV;
    const { id } = req.params;

    const pool = await getPool();
    const check = await pool.request()
      .input('MaLich', sql.Int, id)
      .input('MaHV', sql.Int, maHV)
      .query(`SELECT TrangThai FROM LichPT WHERE MaLich = @MaLich AND MaHV = @MaHV`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tập của bạn' });
    }

    if (check.recordset[0].TrangThai === 'Hoàn thành') {
      return res.status(400).json({ success: false, message: 'Buổi tập đã hoàn thành, không thể hủy' });
    }

    await pool.request()
      .input('MaLich', sql.Int, id)
      .query(`UPDATE LichPT SET TrangThai = N'Đã hủy' WHERE MaLich = @MaLich`);

    res.json({ success: true, message: 'Đã hủy lịch tập thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLichPT,
  getLichPTById,
  createLichPT,
  updateLichPT,
  deleteLichPT,
  getMyLichPT,
  memberBookLichPT,
  memberCancelLichPT
};
