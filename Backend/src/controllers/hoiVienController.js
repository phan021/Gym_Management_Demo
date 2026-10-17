const { getPool, sql } = require('../config/database');
const { generateUsername } = require('./authController');

// Lấy danh sách hội viên (Admin/Nhân viên)
const getAllHoiVien = async (req, res, next) => {
  try {
    const { search, gioiTinh } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        hv.MaHV,
        hv.HoTen,
        hv.NgaySinh,
        dbo.fn_TinhTuoi(hv.NgaySinh) as Tuoi,
        hv.GioiTinh,
        hv.SoDienThoai,
        hv.Email,
        hv.DiaChi,
        hv.NgayThamGia,
        hv.MaTK,
        tk.TenDangNhap,
        tk.TrangThai as TrangThaiTK,
        dbo.fn_TongTienHoiVien(hv.MaHV) as TongTienDaChi,
        (
          SELECT TOP 1 gt.TenGoi
          FROM DangKy dk
          JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
          WHERE dk.MaHV = hv.MaHV AND dk.TrangThai = N'Đang hoạt động'
          ORDER BY dk.NgayKetThuc DESC
        ) as GoiHienTai
      FROM HoiVien hv
      LEFT JOIN TaiKhoan tk ON hv.MaTK = tk.MaTK
      WHERE 1=1
    `;

    const request = pool.request();

    if (search) {
      query += ` AND (hv.HoTen LIKE @Search OR hv.SoDienThoai LIKE @Search OR hv.Email LIKE @Search)`;
      request.input('Search', sql.NVarChar(100), `%${search}%`);
    }

    if (gioiTinh) {
      query += ` AND hv.GioiTinh = @GioiTinh`;
      request.input('GioiTinh', sql.NVarChar(10), gioiTinh);
    }

    query += ` ORDER BY hv.MaHV DESC`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết một hội viên
const getHoiVienById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const hvResult = await pool.request()
      .input('MaHV', sql.Int, id)
      .query(`
        SELECT 
          hv.*,
          dbo.fn_TinhTuoi(hv.NgaySinh) as Tuoi,
          tk.TenDangNhap,
          tk.TrangThai as TrangThaiTK,
          dbo.fn_TongTienHoiVien(hv.MaHV) as TongTienDaChi
        FROM HoiVien hv
        LEFT JOIN TaiKhoan tk ON hv.MaTK = tk.MaTK
        WHERE hv.MaHV = @MaHV
      `);

    if (hvResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hội viên' });
    }

    const hoiVien = hvResult.recordset[0];

    // Lịch sử đăng ký gói
    const dangKyResult = await pool.request()
      .input('MaHV', sql.Int, id)
      .query(`
        SELECT dk.*, gt.TenGoi, gt.ThoiHanThang, gt.Gia,
               dbo.fn_SoNgayConLai(dk.NgayKetThuc) as SoNgayConLai
        FROM DangKy dk
        JOIN GoiTap gt ON dk.MaGoi = gt.MaGoi
        WHERE dk.MaHV = @MaHV
        ORDER BY dk.MaDK DESC
      `);

    // Lịch sử check-in gần nhất (10 lần)
    const checkInResult = await pool.request()
      .input('MaHV', sql.Int, id)
      .query(`
        SELECT TOP 10 *
        FROM CheckIn
        WHERE MaHV = @MaHV
        ORDER BY ThoiGianVao DESC
      `);

    // Lịch tập PT
    const lichPTResult = await pool.request()
      .input('MaHV', sql.Int, id)
      .query(`
        SELECT l.*, pt.HoTen as TenPT, pt.ChuyenMon
        FROM LichPT l
        JOIN PT pt ON l.MaPT = pt.MaPT
        WHERE l.MaHV = @MaHV
        ORDER BY l.NgayTap DESC, l.GioBatDau DESC
      `);

    res.json({
      success: true,
      data: {
        ...hoiVien,
        danhSachDangKy: dangKyResult.recordset,
        danhSachCheckIn: checkInResult.recordset,
        danhSachLichPT: lichPTResult.recordset
      }
    });
  } catch (error) {
    next(error);
  }
};

// Thêm mới hội viên (có thể tự động tạo tài khoản đăng nhập)
const createHoiVien = async (req, res, next) => {
  try {
    const { hoTen, ngaySinh, gioiTinh, soDienThoai, email, diaChi, tenDangNhap, matKhau } = req.body;

    if (!hoTen || !soDienThoai) {
      return res.status(400).json({ success: false, message: 'Họ tên và số điện thoại là bắt buộc' });
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      let maTK = null;

      // Nếu có yêu cầu cấp tài khoản hoặc tự động sinh tài khoản cho hội viên
      let finalUsername = (tenDangNhap || '').trim();
      if (!finalUsername) {
        finalUsername = await generateUsername(pool, hoTen);
      }

      const checkUser = await transaction.request()
        .input('TenDangNhap', sql.VarChar(50), finalUsername)
        .query(`SELECT 1 FROM TaiKhoan WHERE TenDangNhap = @TenDangNhap`);

      if (checkUser.recordset.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Tên đăng nhập ${finalUsername} đã tồn tại trong hệ thống` });
      }

      const tkResult = await transaction.request()
        .input('TenDangNhap', sql.VarChar(50), finalUsername)
        .input('MatKhau', sql.VarChar(255), matKhau || 'Gymthattuyet2006@')
        .input('VaiTro', sql.VarChar(20), 'HOIVIEN')
        .query(`
          INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThai)
          VALUES (@TenDangNhap, @MatKhau, @VaiTro, 1);
          SELECT SCOPE_IDENTITY() as MaTK;
        `);
      maTK = tkResult.recordset[0].MaTK;

      // Kiểm tra SĐT đã tồn tại chưa
      const checkPhone = await transaction.request()
        .input('SoDienThoai', sql.VarChar(15), soDienThoai)
        .query(`SELECT 1 FROM HoiVien WHERE SoDienThoai = @SoDienThoai`);

      if (checkPhone.recordset.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi hội viên khác' });
      }

      const hvResult = await transaction.request()
        .input('HoTen', sql.NVarChar(100), hoTen)
        .input('NgaySinh', sql.Date, ngaySinh || null)
        .input('GioiTinh', sql.NVarChar(10), gioiTinh || 'Nam')
        .input('SoDienThoai', sql.VarChar(15), soDienThoai)
        .input('Email', sql.VarChar(100), email || null)
        .input('DiaChi', sql.NVarChar(255), diaChi || null)
        .input('MaTK', sql.Int, maTK)
        .query(`
          INSERT INTO HoiVien (HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, NgayThamGia, MaTK)
          VALUES (@HoTen, @NgaySinh, @GioiTinh, @SoDienThoai, @Email, @DiaChi, GETDATE(), @MaTK);
          SELECT SCOPE_IDENTITY() as MaHV;
        `);

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Thêm hội viên thành công',
        data: { maHV: hvResult.recordset[0].MaHV, maTK }
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin hội viên
const updateHoiVien = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hoTen, ngaySinh, gioiTinh, soDienThoai, email, diaChi } = req.body;

    if (!hoTen || !soDienThoai) {
      return res.status(400).json({ success: false, message: 'Họ tên và số điện thoại là bắt buộc' });
    }

    const pool = await getPool();

    // Kiểm tra trùng SĐT với người khác
    const checkPhone = await pool.request()
      .input('MaHV', sql.Int, id)
      .input('SoDienThoai', sql.VarChar(15), soDienThoai)
      .query(`SELECT 1 FROM HoiVien WHERE SoDienThoai = @SoDienThoai AND MaHV <> @MaHV`);

    if (checkPhone.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi hội viên khác' });
    }

    await pool.request()
      .input('MaHV', sql.Int, id)
      .input('HoTen', sql.NVarChar(100), hoTen)
      .input('NgaySinh', sql.Date, ngaySinh || null)
      .input('GioiTinh', sql.NVarChar(10), gioiTinh || 'Nam')
      .input('SoDienThoai', sql.VarChar(15), soDienThoai)
      .input('Email', sql.VarChar(100), email || null)
      .input('DiaChi', sql.NVarChar(255), diaChi || null)
      .query(`
        UPDATE HoiVien
        SET HoTen = @HoTen,
            NgaySinh = @NgaySinh,
            GioiTinh = @GioiTinh,
            SoDienThoai = @SoDienThoai,
            Email = @Email,
            DiaChi = @DiaChi
        WHERE MaHV = @MaHV
      `);

    res.json({ success: true, message: 'Cập nhật thông tin hội viên thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa hội viên
const deleteHoiVien = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Kiểm tra liên kết dữ liệu
    const checkDK = await pool.request()
      .input('MaHV', sql.Int, id)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM DangKy WHERE MaHV = @MaHV) as SoDK,
          (SELECT COUNT(*) FROM CheckIn WHERE MaHV = @MaHV) as SoCheckIn,
          (SELECT COUNT(*) FROM LichPT WHERE MaHV = @MaHV) as SoLichPT,
          (SELECT MaTK FROM HoiVien WHERE MaHV = @MaHV) as MaTK
      `);

    const { SoDK, SoCheckIn, SoLichPT, MaTK } = checkDK.recordset[0];

    // Xóa liên quan trong transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Xóa lịch PT
      await transaction.request().input('MaHV', sql.Int, id).query(`DELETE FROM LichPT WHERE MaHV = @MaHV`);
      // Xóa check in
      await transaction.request().input('MaHV', sql.Int, id).query(`DELETE FROM CheckIn WHERE MaHV = @MaHV`);
      // Xóa thanh toan của các dang ky
      await transaction.request().input('MaHV', sql.Int, id).query(`
        DELETE FROM ThanhToan WHERE MaDK IN (SELECT MaDK FROM DangKy WHERE MaHV = @MaHV)
      `);
      // Xóa dang ky
      await transaction.request().input('MaHV', sql.Int, id).query(`DELETE FROM DangKy WHERE MaHV = @MaHV`);
      // Xóa hội viên
      await transaction.request().input('MaHV', sql.Int, id).query(`DELETE FROM HoiVien WHERE MaHV = @MaHV`);
      // Xóa tài khoản nếu có
      if (MaTK) {
        await transaction.request().input('MaTK', sql.Int, MaTK).query(`DELETE FROM TaiKhoan WHERE MaTK = @MaTK`);
      }

      await transaction.commit();
      res.json({ success: true, message: 'Đã xóa hội viên và dữ liệu liên quan thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// Lấy hồ sơ hội viên cá nhân (dành cho Hội viên đăng nhập)
const getMyProfile = async (req, res, next) => {
  try {
    const maHV = req.user.maHV;
    if (!maHV) {
      return res.status(404).json({ success: false, message: 'Tài khoản chưa được liên kết với hồ sơ hội viên' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('MaHV', sql.Int, maHV)
      .query(`
        SELECT 
          hv.*,
          dbo.fn_TinhTuoi(hv.NgaySinh) as Tuoi,
          tk.TenDangNhap,
          dbo.fn_TongTienHoiVien(hv.MaHV) as TongTienDaChi
        FROM HoiVien hv
        LEFT JOIN TaiKhoan tk ON hv.MaTK = tk.MaTK
        WHERE hv.MaHV = @MaHV
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ hội viên' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

// Hội viên tự cập nhật thông tin của mình
const updateMyProfile = async (req, res, next) => {
  try {
    const maHV = req.user.maHV;
    if (!maHV) {
      return res.status(404).json({ success: false, message: 'Tài khoản chưa được liên kết với hồ sơ hội viên' });
    }

    const { hoTen, ngaySinh, gioiTinh, soDienThoai, email, diaChi } = req.body;
    const pool = await getPool();

    // Check trùng số điện thoại với người khác
    if (soDienThoai) {
      const checkPhone = await pool.request()
        .input('MaHV', sql.Int, maHV)
        .input('SoDienThoai', sql.VarChar(15), soDienThoai)
        .query(`SELECT 1 FROM HoiVien WHERE SoDienThoai = @SoDienThoai AND MaHV <> @MaHV`);

      if (checkPhone.recordset.length > 0) {
        return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi hội viên khác' });
      }
    }

    await pool.request()
      .input('MaHV', sql.Int, maHV)
      .input('HoTen', sql.NVarChar(100), hoTen)
      .input('NgaySinh', sql.Date, ngaySinh || null)
      .input('GioiTinh', sql.NVarChar(10), gioiTinh || 'Nam')
      .input('SoDienThoai', sql.VarChar(15), soDienThoai)
      .input('Email', sql.VarChar(100), email || null)
      .input('DiaChi', sql.NVarChar(255), diaChi || null)
      .query(`
        UPDATE HoiVien
        SET HoTen = COALESCE(@HoTen, HoTen),
            NgaySinh = COALESCE(@NgaySinh, NgaySinh),
            GioiTinh = COALESCE(@GioiTinh, GioiTinh),
            SoDienThoai = COALESCE(@SoDienThoai, SoDienThoai),
            Email = COALESCE(@Email, Email),
            DiaChi = COALESCE(@DiaChi, DiaChi)
        WHERE MaHV = @MaHV
      `);

    res.json({ success: true, message: 'Cập nhật thông tin cá nhân thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHoiVien,
  getHoiVienById,
  createHoiVien,
  updateHoiVien,
  deleteHoiVien,
  getMyProfile,
  updateMyProfile
};
