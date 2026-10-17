const { getPool, sql } = require('../config/database');

// Lấy danh sách hóa đơn thanh toán
const getAllThanhToan = async (req, res, next) => {
  try {
    const { trangThai, phuongThuc, search, maHV } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        tt.MaTT,
        tt.MaDK,
        hv.MaHV,
        hv.HoTen as TenHoiVien,
        hv.SoDienThoai as SdtHoiVien,
        gt.TenGoi,
        tt.SoTien,
        tt.NgayThanhToan,
        tt.PhuongThuc,
        tt.TrangThai
      FROM ThanhToan tt
      JOIN DangKy dk ON tt.MaDK = dk.MaDK
      JOIN HoiVien hv ON dk.MaHV = hv.MaHV
      JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
      WHERE 1=1
    `;

    const request = pool.request();

    if (maHV) {
      query += ` AND hv.MaHV = @MaHV`;
      request.input('MaHV', sql.Int, maHV);
    }

    if (trangThai) {
      query += ` AND tt.TrangThai = @TrangThai`;
      request.input('TrangThai', sql.NVarChar(30), trangThai);
    }

    if (phuongThuc) {
      query += ` AND tt.PhuongThuc = @PhuongThuc`;
      request.input('PhuongThuc', sql.NVarChar(30), phuongThuc);
    }

    if (search) {
      query += ` AND (hv.HoTen LIKE @Search OR hv.SoDienThoai LIKE @Search OR gt.TenGoi LIKE @Search)`;
      request.input('Search', sql.NVarChar(100), `%${search}%`);
    }

    query += ` ORDER BY tt.NgayThanhToan DESC`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Chi tiết thanh toán
const getThanhToanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('MaTT', sql.Int, id)
      .query(`
        SELECT 
          tt.*,
          hv.MaHV,
          hv.HoTen as TenHoiVien,
          hv.SoDienThoai,
          gt.TenGoi,
          dk.NgayBatDau,
          dk.NgayKetThuc
        FROM ThanhToan tt
        JOIN DangKy dk ON tt.MaDK = dk.MaDK
        JOIN HoiVien hv ON dk.MaHV = hv.MaHV
        JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
        WHERE tt.MaTT = @MaTT
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn thanh toán' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

// Tạo thanh toán mới
const createThanhToan = async (req, res, next) => {
  try {
    const { maDK, soTien, phuongThuc, trangThai } = req.body;

    if (!maDK || !soTien || !phuongThuc) {
      return res.status(400).json({ success: false, message: 'Mã đăng ký, số tiền và phương thức là bắt buộc' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('MaDK', sql.Int, maDK)
      .input('SoTien', sql.Decimal(18, 2), soTien)
      .input('PhuongThuc', sql.NVarChar(30), phuongThuc)
      .input('TrangThai', sql.NVarChar(30), trangThai || 'Đã thanh toán')
      .query(`
        INSERT INTO ThanhToan (MaDK, SoTien, NgayThanhToan, PhuongThuc, TrangThai)
        VALUES (@MaDK, @SoTien, GETDATE(), @PhuongThuc, @TrangThai);
        SELECT SCOPE_IDENTITY() as MaTT;
      `);

    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thanh toán thành công',
      data: { maTT: result.recordset[0].MaTT }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thanh toán
const updateThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soTien, phuongThuc, trangThai } = req.body;

    const pool = await getPool();

    await pool.request()
      .input('MaTT', sql.Int, id)
      .input('SoTien', sql.Decimal(18, 2), soTien)
      .input('PhuongThuc', sql.NVarChar(30), phuongThuc)
      .input('TrangThai', sql.NVarChar(30), trangThai)
      .query(`
        UPDATE ThanhToan
        SET SoTien = @SoTien,
            PhuongThuc = @PhuongThuc,
            TrangThai = @TrangThai
        WHERE MaTT = @MaTT
      `);

    res.json({ success: true, message: 'Cập nhật thanh toán thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa hóa đơn thanh toán
const deleteThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('MaTT', sql.Int, id)
      .query(`DELETE FROM ThanhToan WHERE MaTT = @MaTT`);

    res.json({ success: true, message: 'Xóa hóa đơn thanh toán thành công' });
  } catch (error) {
    next(error);
  }
};

// Hội viên xem lịch sử thanh toán của chính mình
const getMyThanhToan = async (req, res, next) => {
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
          tt.MaTT,
          tt.MaDK,
          gt.TenGoi,
          tt.SoTien,
          tt.NgayThanhToan,
          tt.PhuongThuc,
          tt.TrangThai
        FROM ThanhToan tt
        JOIN DangKy dk ON tt.MaDK = dk.MaDK
        JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
        WHERE dk.MaHV = @MaHV
        ORDER BY tt.NgayThanhToan DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllThanhToan,
  getThanhToanById,
  createThanhToan,
  updateThanhToan,
  deleteThanhToan,
  getMyThanhToan
};
