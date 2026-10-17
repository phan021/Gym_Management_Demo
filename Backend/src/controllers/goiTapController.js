const { getPool, sql } = require('../config/database');

// Lấy tất cả gói tập
const getAllGoiTap = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        gt.MaGoi,
        gt.TenGoi,
        gt.ThoiHanThang,
        gt.Gia,
        gt.MoTa,
        gt.TrangThai,
        COUNT(dk.MaDK) as SoLuotDangKy
      FROM GoiTap gt
      LEFT JOIN DangKy dk ON gt.MaGoi = dk.MaGoi
      WHERE 1=1
    `;

    if (activeOnly === 'true') {
      query += ` AND gt.TrangThai = 1`;
    }

    query += `
      GROUP BY gt.MaGoi, gt.TenGoi, gt.ThoiHanThang, gt.Gia, gt.MoTa, gt.TrangThai
      ORDER BY gt.Gia ASC
    `;

    const result = await pool.request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Chi tiết gói tập
const getGoiTapById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('MaGoi', sql.Int, id)
      .query(`SELECT * FROM GoiTap WHERE MaGoi = @MaGoi`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói tập' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

// Thêm mới gói tập
const createGoiTap = async (req, res, next) => {
  try {
    const { tenGoi, thoiHanThang, gia, moTa, trangThai } = req.body;

    if (!tenGoi || !thoiHanThang || gia === undefined) {
      return res.status(400).json({ success: false, message: 'Tên gói, thời hạn và giá là bắt buộc' });
    }

    const pool = await getPool();

    // Kiểm tra trùng tên gói
    const checkName = await pool.request()
      .input('TenGoi', sql.NVarChar(100), tenGoi)
      .query(`SELECT 1 FROM GoiTap WHERE TenGoi = @TenGoi`);

    if (checkName.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên gói tập này đã tồn tại' });
    }

    const result = await pool.request()
      .input('TenGoi', sql.NVarChar(100), tenGoi)
      .input('ThoiHanThang', sql.Int, thoiHanThang)
      .input('Gia', sql.Decimal(18, 2), gia)
      .input('MoTa', sql.NVarChar(500), moTa || null)
      .input('TrangThai', sql.Bit, trangThai !== undefined ? trangThai : 1)
      .query(`
        INSERT INTO GoiTap (TenGoi, ThoiHanThang, Gia, MoTa, TrangThai)
        VALUES (@TenGoi, @ThoiHanThang, @Gia, @MoTa, @TrangThai);
        SELECT SCOPE_IDENTITY() as MaGoi;
      `);

    res.status(201).json({
      success: true,
      message: 'Thêm gói tập thành công',
      data: { maGoi: result.recordset[0].MaGoi }
    });
  } catch (error) {
    next(error);
  }
};

// Sửa gói tập
const updateGoiTap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenGoi, thoiHanThang, gia, moTa, trangThai } = req.body;

    const pool = await getPool();

    // Check trùng tên với gói khác
    if (tenGoi) {
      const checkName = await pool.request()
        .input('MaGoi', sql.Int, id)
        .input('TenGoi', sql.NVarChar(100), tenGoi)
        .query(`SELECT 1 FROM GoiTap WHERE TenGoi = @TenGoi AND MaGoi <> @MaGoi`);

      if (checkName.recordset.length > 0) {
        return res.status(400).json({ success: false, message: 'Tên gói tập này đã tồn tại' });
      }
    }

    await pool.request()
      .input('MaGoi', sql.Int, id)
      .input('TenGoi', sql.NVarChar(100), tenGoi)
      .input('ThoiHanThang', sql.Int, thoiHanThang)
      .input('Gia', sql.Decimal(18, 2), gia)
      .input('MoTa', sql.NVarChar(500), moTa || null)
      .input('TrangThai', sql.Bit, trangThai !== undefined ? (trangThai ? 1 : 0) : 1)
      .query(`
        UPDATE GoiTap
        SET TenGoi = @TenGoi,
            ThoiHanThang = @ThoiHanThang,
            Gia = @Gia,
            MoTa = @MoTa,
            TrangThai = @TrangThai
        WHERE MaGoi = @MaGoi
      `);

    res.json({ success: true, message: 'Cập nhật gói tập thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa gói tập (hoặc ngừng hoạt động nếu đã có người đăng ký)
const deleteGoiTap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const checkUsage = await pool.request()
      .input('MaGoi', sql.Int, id)
      .query(`SELECT COUNT(*) as count FROM DangKy WHERE MaGoi = @MaGoi`);

    if (checkUsage.recordset[0].count > 0) {
      // Đã có đăng ký -> chuyển sang ngừng hoạt động
      await pool.request()
        .input('MaGoi', sql.Int, id)
        .query(`UPDATE GoiTap SET TrangThai = 0 WHERE MaGoi = @MaGoi`);

      return res.json({
        success: true,
        message: 'Gói tập đã có hội viên đăng ký nên đã chuyển trạng thái sang [Ngừng hoạt động]'
      });
    }

    await pool.request()
      .input('MaGoi', sql.Int, id)
      .query(`DELETE FROM GoiTap WHERE MaGoi = @MaGoi`);

    res.json({ success: true, message: 'Xóa gói tập thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGoiTap,
  getGoiTapById,
  createGoiTap,
  updateGoiTap,
  deleteGoiTap
};
