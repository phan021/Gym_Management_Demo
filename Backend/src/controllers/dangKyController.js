const { getPool, sql } = require('../config/database');

// Lấy danh sách đăng ký gói tập
const getAllDangKy = async (req, res, next) => {
  try {
    const { trangThai, search, maHV } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        dk.MaDK,
        dk.MaHV,
        hv.HoTen as TenHoiVien,
        hv.SoDienThoai as SdtHoiVien,
        dk.MaGoi,
        gt.TenGoi,
        gt.ThoiHanThang,
        gt.Gia,
        dk.NgayDangKy,
        dk.NgayBatDau,
        dk.NgayKetThuc,
        dk.TrangThai,
        dbo.fn_SoNgayConLai(dk.NgayKetThuc) as SoNgayConLai,
        (
          SELECT TOP 1 tt.TrangThai
          FROM ThanhToan tt
          WHERE tt.MaDK = dk.MaDK
          ORDER BY tt.MaTT DESC
        ) as TrangThaiThanhToan,
        (
          SELECT TOP 1 tt.MaTT
          FROM ThanhToan tt
          WHERE tt.MaDK = dk.MaDK
          ORDER BY tt.MaTT DESC
        ) as MaTT
      FROM DangKy dk
      JOIN HoiVien hv ON dk.MaHV = hv.MaHV
      JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
      WHERE 1=1
    `;

    const request = pool.request();

    if (maHV) {
      query += ` AND dk.MaHV = @MaHV`;
      request.input('MaHV', sql.Int, maHV);
    }

    if (trangThai) {
      query += ` AND dk.TrangThai = @TrangThai`;
      request.input('TrangThai', sql.NVarChar(30), trangThai);
    }

    if (search) {
      query += ` AND (hv.HoTen LIKE @Search OR hv.SoDienThoai LIKE @Search OR gt.TenGoi LIKE @Search)`;
      request.input('Search', sql.NVarChar(100), `%${search}%`);
    }

    query += ` ORDER BY dk.MaDK DESC`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Chi tiết đăng ký
const getDangKyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('MaDK', sql.Int, id)
      .query(`
        SELECT 
          dk.*,
          hv.HoTen as TenHoiVien,
          hv.SoDienThoai,
          hv.Email,
          gt.TenGoi,
          gt.Gia,
          gt.ThoiHanThang,
          dbo.fn_SoNgayConLai(dk.NgayKetThuc) as SoNgayConLai
        FROM DangKy dk
        JOIN HoiVien hv ON dk.MaHV = hv.MaHV
        JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
        WHERE dk.MaDK = @MaDK
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đăng ký' });
    }

    // Lấy thông tin thanh toán kèm theo
    const ttResult = await pool.request()
      .input('MaDK', sql.Int, id)
      .query(`SELECT * FROM ThanhToan WHERE MaDK = @MaDK ORDER BY MaTT DESC`);

    res.json({
      success: true,
      data: {
        ...result.recordset[0],
        thanhToan: ttResult.recordset
      }
    });
  } catch (error) {
    next(error);
  }
};

// Đăng ký gói tập mới (gọi stored procedure sp_DangKyGoiTap hoặc transaction tạo thanh toán tự động)
const createDangKy = async (req, res, next) => {
  try {
    const { maHV, maGoi, ngayBatDau, tuDongThanhToan, phuongThuc } = req.body;

    if (!maHV || !maGoi || !ngayBatDau) {
      return res.status(400).json({ success: false, message: 'Mã hội viên, mã gói tập và ngày bắt đầu là bắt buộc' });
    }

    const pool = await getPool();

    // 1. Kiểm tra gói tập muốn đăng ký
    const checkGoi = await pool.request()
      .input('MaGoi', sql.Int, maGoi)
      .query(`SELECT TenGoi, ThoiHanThang, Gia FROM GoiTap WHERE MaGoi = @MaGoi AND TrangThai = 1`);
    if (checkGoi.recordset.length === 0) {
      return res.status(400).json({ success: false, message: 'Gói tập không tồn tại hoặc đã ngừng hoạt động' });
    }
    const newGoi = checkGoi.recordset[0];

    // 2. Kiểm tra nếu hội viên đang có gói lớn hơn còn hiệu lực thì KHÔNG được đăng ký gói nhỏ hơn
    const activePkgRes = await pool.request()
      .input('MaHV', sql.Int, maHV)
      .query(`
        SELECT TOP 1 dk.MaDK, gt.TenGoi, gt.ThoiHanThang, gt.Gia
        FROM DangKy dk
        JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
        WHERE dk.MaHV = @MaHV 
          AND dk.TrangThai = N'Đang hoạt động' 
          AND dk.NgayKetThuc >= CAST(GETDATE() AS DATE)
        ORDER BY gt.Gia DESC, gt.ThoiHanThang DESC
      `);

    if (activePkgRes.recordset.length > 0) {
      const currentPkg = activePkgRes.recordset[0];
      if (newGoi.Gia < currentPkg.Gia || newGoi.ThoiHanThang < currentPkg.ThoiHanThang) {
        return res.status(400).json({
          success: false,
          message: `Bạn đang có gói tập lớn hơn (${currentPkg.TenGoi} - ${currentPkg.ThoiHanThang} tháng) đang hoạt động. Không được phép đăng ký gói tập nhỏ hơn!`
        });
      }
    }

    if (tuDongThanhToan) {
      // Transaction: Đăng ký + Thanh toán đồng thời
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // Kiểm tra hội viên
        const checkHV = await transaction.request()
          .input('MaHV', sql.Int, maHV)
          .query(`SELECT 1 FROM HoiVien WHERE MaHV = @MaHV`);
        if (checkHV.recordset.length === 0) {
          throw new Error('Hội viên không tồn tại trong hệ thống');
        }

        const { ThoiHanThang, Gia } = newGoi;

        // Tự động hủy các gói đang hoạt động trước đó của hội viên này khi đăng ký gói mới lớn hơn
        await transaction.request()
          .input('MaHV', sql.Int, maHV)
          .query(`UPDATE DangKy SET TrangThai = N'Đã hủy' WHERE MaHV = @MaHV AND TrangThai = N'Đang hoạt động'`);

        // Tính ngày kết thúc
        const calcDate = await transaction.request()
          .input('ThoiHanThang', sql.Int, ThoiHanThang)
          .input('NgayBatDau', sql.Date, ngayBatDau)
          .query(`SELECT DATEADD(day, -1, DATEADD(month, @ThoiHanThang, @NgayBatDau)) as NgayKetThuc`);
        const ngayKetThuc = calcDate.recordset[0].NgayKetThuc;

        // Thêm đăng ký
        const dkRes = await transaction.request()
          .input('MaHV', sql.Int, maHV)
          .input('MaGoi', sql.Int, maGoi)
          .input('NgayBatDau', sql.Date, ngayBatDau)
          .input('NgayKetThuc', sql.Date, ngayKetThuc)
          .query(`
            INSERT INTO DangKy (MaHV, MaGoi, NgayDangKy, NgayBatDau, NgayKetThuc, TrangThai)
            VALUES (@MaHV, @MaGoi, GETDATE(), @NgayBatDau, @NgayKetThuc, N'Đang hoạt động');
            SELECT SCOPE_IDENTITY() as MaDK;
          `);
        const maDK = dkRes.recordset[0].MaDK;

        // Tạo hóa đơn thanh toán
        await transaction.request()
          .input('MaDK', sql.Int, maDK)
          .input('SoTien', sql.Decimal(18, 2), Gia)
          .input('PhuongThuc', sql.NVarChar(30), phuongThuc || 'Tiền mặt')
          .query(`
            INSERT INTO ThanhToan (MaDK, SoTien, NgayThanhToan, PhuongThuc, TrangThai)
            VALUES (@MaDK, @SoTien, GETDATE(), @PhuongThuc, N'Đã thanh toán');
          `);

        await transaction.commit();
        return res.status(201).json({
          success: true,
          message: 'Đăng ký gói tập thành công. Gói tập cũ đã được tự động hủy.',
          data: { maDK }
        });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } else {
      // Dùng Stored Procedure sp_DangKyGoiTap có sẵn trong database
      const result = await pool.request()
        .input('MaHV', sql.Int, maHV)
        .input('MaGoi', sql.Int, maGoi)
        .input('NgayBatDau', sql.Date, ngayBatDau)
        .execute('sp_DangKyGoiTap');

      return res.status(201).json({
        success: true,
        message: result.recordset[0]?.ThongBao || 'Đăng ký gói tập thành công',
        data: { maDK: result.recordset[0]?.MaDKMoi }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin đăng ký (gia hạn, đổi trạng thái)
const updateDangKy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngayBatDau, ngayKetThuc, trangThai } = req.body;

    const pool = await getPool();

    await pool.request()
      .input('MaDK', sql.Int, id)
      .input('NgayBatDau', sql.Date, ngayBatDau)
      .input('NgayKetThuc', sql.Date, ngayKetThuc)
      .input('TrangThai', sql.NVarChar(20), trangThai)
      .query(`
        UPDATE DangKy
        SET NgayBatDau = @NgayBatDau,
            NgayKetThuc = @NgayKetThuc,
            TrangThai = @TrangThai
        WHERE MaDK = @MaDK
      `);

    res.json({ success: true, message: 'Cập nhật đăng ký gói thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa bản ghi đăng ký
const deleteDangKy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Xóa thanh toán của gói trước
      await transaction.request()
        .input('MaDK', sql.Int, id)
        .query(`DELETE FROM ThanhToan WHERE MaDK = @MaDK`);

      // Xóa đăng ký
      await transaction.request()
        .input('MaDK', sql.Int, id)
        .query(`DELETE FROM DangKy WHERE MaDK = @MaDK`);

      await transaction.commit();
      res.json({ success: true, message: 'Xóa đăng ký gói tập thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// Dành cho Hội viên: Xem các gói đã đăng ký của chính mình
const getMyDangKy = async (req, res, next) => {
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
          dk.MaDK,
          dk.MaHV,
          dk.MaGoi,
          gt.TenGoi,
          gt.ThoiHanThang,
          gt.Gia,
          gt.MoTa,
          dk.NgayDangKy,
          dk.NgayBatDau,
          dk.NgayKetThuc,
          dk.TrangThai,
          dbo.fn_SoNgayConLai(dk.NgayKetThuc) as SoNgayConLai,
          (
            SELECT TOP 1 tt.TrangThai
            FROM ThanhToan tt
            WHERE tt.MaDK = dk.MaDK
            ORDER BY tt.MaTT DESC
          ) as TrangThaiThanhToan
        FROM DangKy dk
        JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
        WHERE dk.MaHV = @MaHV
        ORDER BY dk.MaDK DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Hủy gói đăng ký (hội viên hoặc admin có thể hủy)
const cancelDangKy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const checkRes = await pool.request()
      .input('MaDK', sql.Int, id)
      .query(`SELECT MaDK, MaHV, TrangThai FROM DangKy WHERE MaDK = @MaDK`);

    if (checkRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đăng ký gói tập' });
    }

    const dk = checkRes.recordset[0];

    if (req.user.vaiTro !== 'ADMIN' && req.user.vaiTro !== 'NHANVIEN') {
      if (dk.MaHV !== req.user.maHV) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy gói tập của hội viên khác' });
      }
    }

    if (dk.TrangThai === 'Đã hủy') {
      return res.status(400).json({ success: false, message: 'Gói tập này đã được hủy trước đó' });
    }

    await pool.request()
      .input('MaDK', sql.Int, id)
      .query(`UPDATE DangKy SET TrangThai = N'Đã hủy' WHERE MaDK = @MaDK`);

    res.json({ success: true, message: 'Đã hủy gói tập thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDangKy,
  getDangKyById,
  createDangKy,
  updateDangKy,
  deleteDangKy,
  getMyDangKy,
  cancelDangKy
};

