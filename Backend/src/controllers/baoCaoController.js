const { getPool, sql } = require('../config/database');

// Tổng quan thống kê cho Dashboard
const getTongQuan = async (req, res, next) => {
  try {
    const pool = await getPool();

    // 1. Thống kê số lượng
    const counts = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM HoiVien) as TongHoiVien,
        (SELECT COUNT(*) FROM DangKy WHERE TrangThai = N'Đang hoạt động') as GoiDangHoatDong,
        (SELECT COUNT(*) FROM PT WHERE TrangThai = 1) as TongPT,
        (SELECT COUNT(*) FROM CheckIn WHERE CAST(ThoiGianVao AS DATE) = CAST(GETDATE() AS DATE)) as CheckInHomNay,
        (SELECT COUNT(*) FROM CheckIn WHERE ThoiGianRa IS NULL) as DangTapTrongGym,
        (SELECT ISNULL(SUM(SoTien), 0) FROM ThanhToan WHERE TrangThai = N'Đã thanh toán') as TongDoanhThu
    `);

    // 2. Doanh thu tháng hiện tại
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await pool.request()
      .input('Thang', sql.Int, currentMonth)
      .input('Nam', sql.Int, currentYear)
      .execute('sp_BaoCaoDoanhThuTheoThang');

    // 3. Top các gói tập phổ biến (dùng view)
    const topGoiTap = await pool.request().query(`
      SELECT * FROM vw_ThongKe_GoiTap ORDER BY SoLuotDangKy DESC
    `);

    // 4. Lịch sử thanh toán gần nhất
    const recentPayments = await pool.request().query(`
      SELECT TOP 5 * FROM vw_ThanhToan_HoiVien ORDER BY NgayThanhToan DESC
    `);

    // 5. Check-in gần nhất
    const recentCheckIns = await pool.request().query(`
      SELECT TOP 5 
        ci.MaCheckIn, hv.HoTen as TenHoiVien, ci.ThoiGianVao, ci.ThoiGianRa
      FROM CheckIn ci
      JOIN HoiVien hv ON ci.MaHV = hv.MaHV
      ORDER BY ci.ThoiGianVao DESC
    `);

    res.json({
      success: true,
      data: {
        tongQuan: counts.recordset[0],
        doanhThuThangHienTai: monthlyRevenue.recordset[0] || { Thang: currentMonth, Nam: currentYear, SoGiaoDich: 0, TongDoanhThu: 0 },
        topGoiTap: topGoiTap.recordset,
        giaoDichMoi: recentPayments.recordset,
        checkInMoi: recentCheckIns.recordset
      }
    });
  } catch (error) {
    next(error);
  }
};

// Báo cáo doanh thu theo tháng chỉ định (gọi sp_BaoCaoDoanhThuTheoThang)
const getDoanhThuTheoThang = async (req, res, next) => {
  try {
    const { thang, nam } = req.query;
    const currentMonth = thang ? parseInt(thang, 10) : new Date().getMonth() + 1;
    const currentYear = nam ? parseInt(nam, 10) : new Date().getFullYear();

    const pool = await getPool();
    const result = await pool.request()
      .input('Thang', sql.Int, currentMonth)
      .input('Nam', sql.Int, currentYear)
      .execute('sp_BaoCaoDoanhThuTheoThang');

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
};

// Báo cáo doanh thu 12 tháng trong năm để vẽ biểu đồ
const getDoanhThu12Thang = async (req, res, next) => {
  try {
    const { nam } = req.query;
    const targetYear = nam ? parseInt(nam, 10) : new Date().getFullYear();

    const pool = await getPool();
    const result = await pool.request()
      .input('Nam', sql.Int, targetYear)
      .query(`
        SELECT 
          MONTH(NgayThanhToan) as Thang,
          COUNT(*) as SoGiaoDich,
          ISNULL(SUM(SoTien), 0) as TongTien
        FROM ThanhToan
        WHERE YEAR(NgayThanhToan) = @Nam AND TrangThai = N'Đã thanh toán'
        GROUP BY MONTH(NgayThanhToan)
        ORDER BY Thang ASC
      `);

    // Chuẩn hóa 12 tháng đầy đủ
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const found = result.recordset.find(r => r.Thang === m);
      monthlyData.push({
        thang: `T${m}`,
        thangSo: m,
        nam: targetYear,
        soGiaoDich: found ? found.SoGiaoDich : 0,
        tongDoanhThu: found ? found.TongTien : 0
      });
    }

    res.json({ success: true, data: monthlyData });
  } catch (error) {
    next(error);
  }
};

// Thống kê gói tập
const getThongKeGoiTap = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM vw_ThongKe_GoiTap ORDER BY SoLuotDangKy DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTongQuan,
  getDoanhThuTheoThang,
  getDoanhThu12Thang,
  getThongKeGoiTap
};
