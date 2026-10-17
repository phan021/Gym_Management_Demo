const { getPool, sql } = require('../config/database');

// Lấy danh sách PT
const getAllPT = async (req, res, next) => {
  try {
    const { activeOnly, chuyenMon, search } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        pt.MaPT,
        pt.HoTen,
        pt.SoDienThoai,
        pt.Email,
        pt.ChuyenMon,
        pt.KinhNghiem,
        pt.Luong,
        pt.TrangThai,
        COUNT(l.MaLich) as TongSoBuoiTap,
        SUM(CASE WHEN l.TrangThai = N'Hoàn thành' THEN 1 ELSE 0 END) as SoBuoiHoanThanh
      FROM PT pt
      LEFT JOIN LichPT l ON pt.MaPT = l.MaPT
      WHERE 1=1
    `;

    const request = pool.request();

    if (activeOnly === 'true') {
      query += ` AND pt.TrangThai = 1`;
    }

    if (chuyenMon) {
      query += ` AND pt.ChuyenMon LIKE @ChuyenMon`;
      request.input('ChuyenMon', sql.NVarChar(100), `%${chuyenMon}%`);
    }

    if (search) {
      query += ` AND (pt.HoTen LIKE @Search OR pt.SoDienThoai LIKE @Search OR pt.ChuyenMon LIKE @Search)`;
      request.input('Search', sql.NVarChar(100), `%${search}%`);
    }

    query += `
      GROUP BY pt.MaPT, pt.HoTen, pt.SoDienThoai, pt.Email, pt.ChuyenMon, pt.KinhNghiem, pt.Luong, pt.TrangThai
      ORDER BY pt.MaPT DESC
    `;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết PT và lịch dạy
const getPTById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const ptResult = await pool.request()
      .input('MaPT', sql.Int, id)
      .query(`SELECT * FROM PT WHERE MaPT = @MaPT`);

    if (ptResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin huấn luyện viên' });
    }

    const lichResult = await pool.request()
      .input('MaPT', sql.Int, id)
      .query(`
        SELECT l.*, hv.HoTen as TenHoiVien, hv.SoDienThoai as SdtHoiVien
        FROM LichPT l
        JOIN HoiVien hv ON l.MaHV = hv.MaHV
        WHERE l.MaPT = @MaPT
        ORDER BY l.NgayTap DESC, l.GioBatDau DESC
      `);

    res.json({
      success: true,
      data: {
        ...ptResult.recordset[0],
        danhSachLichTap: lichResult.recordset
      }
    });
  } catch (error) {
    next(error);
  }
};

// Thêm PT mới
const createPT = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, email, chuyenMon, kinhNghiem, luong, trangThai } = req.body;

    if (!hoTen || !soDienThoai || !chuyenMon) {
      return res.status(400).json({ success: false, message: 'Họ tên, SĐT và chuyên môn là bắt buộc' });
    }

    const pool = await getPool();

    // Check trùng SĐT
    const checkPhone = await pool.request()
      .input('SoDienThoai', sql.VarChar(15), soDienThoai)
      .query(`SELECT 1 FROM PT WHERE SoDienThoai = @SoDienThoai`);

    if (checkPhone.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi PT khác' });
    }

    const result = await pool.request()
      .input('HoTen', sql.NVarChar(100), hoTen)
      .input('SoDienThoai', sql.VarChar(15), soDienThoai)
      .input('Email', sql.VarChar(100), email || null)
      .input('ChuyenMon', sql.NVarChar(100), chuyenMon)
      .input('KinhNghiem', sql.Int, kinhNghiem !== undefined ? kinhNghiem : 0)
      .input('Luong', sql.Decimal(18, 2), luong !== undefined ? luong : null)
      .input('TrangThai', sql.Bit, trangThai !== undefined ? trangThai : 1)
      .query(`
        INSERT INTO PT (HoTen, SoDienThoai, Email, ChuyenMon, KinhNghiem, Luong, TrangThai)
        VALUES (@HoTen, @SoDienThoai, @Email, @ChuyenMon, @KinhNghiem, @Luong, @TrangThai);
        SELECT SCOPE_IDENTITY() as MaPT;
      `);

    res.status(201).json({
      success: true,
      message: 'Thêm huấn luyện viên (PT) thành công',
      data: { maPT: result.recordset[0].MaPT }
    });
  } catch (error) {
    next(error);
  }
};

// Sửa PT
const updatePT = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hoTen, soDienThoai, email, chuyenMon, kinhNghiem, luong, trangThai } = req.body;

    const pool = await getPool();

    // Check trùng SĐT
    if (soDienThoai) {
      const checkPhone = await pool.request()
        .input('MaPT', sql.Int, id)
        .input('SoDienThoai', sql.VarChar(15), soDienThoai)
        .query(`SELECT 1 FROM PT WHERE SoDienThoai = @SoDienThoai AND MaPT <> @MaPT`);

      if (checkPhone.recordset.length > 0) {
        return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi PT khác' });
      }
    }

    await pool.request()
      .input('MaPT', sql.Int, id)
      .input('HoTen', sql.NVarChar(100), hoTen)
      .input('SoDienThoai', sql.VarChar(15), soDienThoai)
      .input('Email', sql.VarChar(100), email || null)
      .input('ChuyenMon', sql.NVarChar(100), chuyenMon)
      .input('KinhNghiem', sql.Int, kinhNghiem)
      .input('Luong', sql.Decimal(18, 2), luong)
      .input('TrangThai', sql.Bit, trangThai !== undefined ? (trangThai ? 1 : 0) : 1)
      .query(`
        UPDATE PT
        SET HoTen = @HoTen,
            SoDienThoai = @SoDienThoai,
            Email = @Email,
            ChuyenMon = @ChuyenMon,
            KinhNghiem = @KinhNghiem,
            Luong = @Luong,
            TrangThai = @TrangThai
        WHERE MaPT = @MaPT
      `);

    res.json({ success: true, message: 'Cập nhật thông tin huấn luyện viên thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa PT
const deletePT = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const checkLich = await pool.request()
      .input('MaPT', sql.Int, id)
      .query(`SELECT COUNT(*) as count FROM LichPT WHERE MaPT = @MaPT`);

    if (checkLich.recordset[0].count > 0) {
      // Đã có lịch đặt -> chuyển sang trạng thái ngừng hoạt động
      await pool.request()
        .input('MaPT', sql.Int, id)
        .query(`UPDATE PT SET TrangThai = 0 WHERE MaPT = @MaPT`);

      return res.json({
        success: true,
        message: 'Huấn luyện viên đã có lịch tập nên đã chuyển trạng thái sang [Ngừng làm việc]'
      });
    }

    await pool.request()
      .input('MaPT', sql.Int, id)
      .query(`DELETE FROM PT WHERE MaPT = @MaPT`);

    res.json({ success: true, message: 'Xóa huấn luyện viên thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPT,
  getPTById,
  createPT,
  updatePT,
  deletePT
};
