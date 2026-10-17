const { getPool, sql } = require('../config/database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

// Hàm sinh tên đăng nhập theo quy tắc: 1 chữ cái đầu họ + 1 chữ cái đầu tên + 01, 02...
const generateUsername = async (pool, hoTen) => {
  const removeVietnameseTones = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase();
  };

  const words = (hoTen || 'Hoi Vien').trim().split(/\s+/);
  const firstLetter = removeVietnameseTones(words[0].charAt(0));
  const lastLetter = removeVietnameseTones(words[words.length - 1].charAt(0));
  const prefix = (firstLetter + lastLetter).replace(/[^a-z0-9]/g, '') || 'hv';

  const res = await pool.request()
    .input('Prefix', sql.VarChar(10), `${prefix}%`)
    .query(`SELECT TenDangNhap FROM TaiKhoan WHERE TenDangNhap LIKE @Prefix`);

  const existing = res.recordset.map(r => r.TenDangNhap.toLowerCase());
  let index = 1;
  let candidate = `${prefix}${String(index).padStart(2, '0')}`;
  while (existing.includes(candidate.toLowerCase())) {
    index++;
    candidate = `${prefix}${String(index).padStart(2, '0')}`;
  }
  return candidate;
};

// Đăng nhập (hỗ trợ đăng nhập bằng Tên đăng nhập HOẶC Email)
const login = async (req, res, next) => {
  try {
    const { taiKhoan, tenDangNhap, matKhau } = req.body;
    const accountInput = (taiKhoan || tenDangNhap || '').trim();

    if (!accountInput || !matKhau) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập (hoặc email) và mật khẩu' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('Account', sql.VarChar(100), accountInput)
      .query(`
        SELECT tk.MaTK, tk.TenDangNhap, tk.MatKhau, tk.VaiTro, tk.TrangThai,
               hv.MaHV, hv.HoTen, hv.SoDienThoai, hv.Email, hv.NgayThamGia
        FROM TaiKhoan tk
        LEFT JOIN HoiVien hv ON tk.MaTK = hv.MaTK
        WHERE tk.TenDangNhap = @Account OR LOWER(hv.Email) = LOWER(@Account)
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập / Email hoặc mật khẩu không chính xác' });
    }

    const user = result.recordset[0];

    if (!user.TrangThai) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa' });
    }

    // So sánh mật khẩu
    if (user.MatKhau !== matKhau) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập / Email hoặc mật khẩu không chính xác' });
    }

    const payload = {
      maTK: user.MaTK,
      tenDangNhap: user.TenDangNhap,
      vaiTro: user.VaiTro,
      maHV: user.MaHV || null,
      hoTen: user.HoTen || (user.VaiTro === 'ADMIN' ? 'Quản trị viên' : user.TenDangNhap)
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          maTK: user.MaTK,
          tenDangNhap: user.TenDangNhap,
          vaiTro: user.VaiTro,
          maHV: user.MaHV,
          hoTen: payload.hoTen,
          email: user.Email,
          soDienThoai: user.SoDienThoai
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Đăng ký tài khoản dành riêng cho Hội viên
const register = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, email, matKhau, xacNhanMatKhau, diaChi, gioiTinh } = req.body;

    if (!hoTen || !soDienThoai || !email || !matKhau) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, số điện thoại, email và mật khẩu' });
    }

    if (matKhau !== xacNhanMatKhau) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    if (matKhau.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên' });
    }

    const pool = await getPool();

    // Kiểm tra trùng Email
    const checkEmail = await pool.request()
      .input('Email', sql.VarChar(100), email.trim())
      .query(`SELECT 1 FROM HoiVien WHERE Email = @Email`);
    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }

    // Kiểm tra trùng SĐT
    const checkPhone = await pool.request()
      .input('SoDienThoai', sql.VarChar(15), soDienThoai.trim())
      .query(`SELECT 1 FROM HoiVien WHERE SoDienThoai = @SoDienThoai`);
    if (checkPhone.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng' });
    }

    // Tự sinh tên đăng nhập theo quy tắc (ví dụ: Nguyễn Văn Anh -> na01)
    const tenDangNhap = await generateUsername(pool, hoTen);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Tạo tài khoản
      const tkRes = await transaction.request()
        .input('TenDangNhap', sql.VarChar(50), tenDangNhap)
        .input('MatKhau', sql.VarChar(255), matKhau)
        .input('VaiTro', sql.VarChar(20), 'HOIVIEN')
        .query(`
          INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThai)
          VALUES (@TenDangNhap, @MatKhau, @VaiTro, 1);
          SELECT SCOPE_IDENTITY() as MaTK;
        `);
      const maTK = tkRes.recordset[0].MaTK;

      // 2. Tạo hồ sơ hội viên
      const hvRes = await transaction.request()
        .input('HoTen', sql.NVarChar(100), hoTen.trim())
        .input('GioiTinh', sql.NVarChar(10), gioiTinh || 'Nam')
        .input('SoDienThoai', sql.VarChar(15), soDienThoai.trim())
        .input('Email', sql.VarChar(100), email.trim())
        .input('DiaChi', sql.NVarChar(255), diaChi || null)
        .input('MaTK', sql.Int, maTK)
        .query(`
          INSERT INTO HoiVien (HoTen, GioiTinh, SoDienThoai, Email, DiaChi, NgayThamGia, MaTK)
          VALUES (@HoTen, @GioiTinh, @SoDienThoai, @Email, @DiaChi, GETDATE(), @MaTK);
          SELECT SCOPE_IDENTITY() as MaHV;
        `);
      const maHV = hvRes.recordset[0].MaHV;

      await transaction.commit();

      // Sinh token tự động đăng nhập luôn
      const payload = {
        maTK,
        tenDangNhap,
        vaiTro: 'HOIVIEN',
        maHV,
        hoTen: hoTen.trim()
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        message: `Đăng ký thành công! Tên đăng nhập của bạn là: ${tenDangNhap}`,
        data: {
          token,
          user: {
            maTK,
            tenDangNhap,
            vaiTro: 'HOIVIEN',
            maHV,
            hoTen: hoTen.trim(),
            email: email.trim(),
            soDienThoai: soDienThoai.trim()
          }
        }
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin tài khoản hiện tại
const getMe = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaTK', sql.Int, req.user.maTK)
      .query(`
        SELECT tk.MaTK, tk.TenDangNhap, tk.VaiTro, tk.TrangThai,
               hv.MaHV, hv.HoTen, hv.NgaySinh, hv.GioiTinh, hv.SoDienThoai, hv.Email, hv.DiaChi, hv.NgayThamGia
        FROM TaiKhoan tk
        LEFT JOIN HoiVien hv ON tk.MaTK = hv.MaTK
        WHERE tk.MaTK = @MaTK
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu (dành cho cả Người dùng và Admin)
const changePassword = async (req, res, next) => {
  try {
    const { matKhauCu, matKhauMoi, xacNhanMatKhau } = req.body;

    if (!matKhauCu || !matKhauMoi) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
    }

    if (xacNhanMatKhau && matKhauMoi !== xacNhanMatKhau) {
      return res.status(400).json({ success: false, message: 'Xác nhận mật khẩu mới không khớp' });
    }

    if (matKhauMoi.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const pool = await getPool();
    const userRes = await pool.request()
      .input('MaTK', sql.Int, req.user.maTK)
      .query(`SELECT MatKhau FROM TaiKhoan WHERE MaTK = @MaTK`);

    if (userRes.recordset.length === 0 || userRes.recordset[0].MatKhau !== matKhauCu) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    await pool.request()
      .input('MaTK', sql.Int, req.user.maTK)
      .input('MatKhauMoi', sql.VarChar(255), matKhauMoi)
      .query(`UPDATE TaiKhoan SET MatKhau = @MatKhauMoi WHERE MaTK = @MaTK`);

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách tài khoản (cho ADMIN)
const getAllAccounts = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT tk.MaTK, tk.TenDangNhap, tk.VaiTro, tk.TrangThai,
             hv.MaHV, hv.HoTen, hv.Email
      FROM TaiKhoan tk
      LEFT JOIN HoiVien hv ON tk.MaTK = hv.MaTK
      ORDER BY tk.MaTK DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  changePassword,
  getAllAccounts,
  generateUsername
};
