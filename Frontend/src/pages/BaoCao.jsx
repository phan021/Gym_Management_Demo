import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter, 
  Package,
  Layers,
  Award
} from 'lucide-react';
import baoCaoService from '../services/baoCaoService';

export const BaoCao = () => {
  const currentDate = new Date();
  const [thang, setThang] = useState(currentDate.getMonth() + 1);
  const [nam, setNam] = useState(currentDate.getFullYear());

  const [monthlyReport, setMonthlyReport] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [goiTapStats, setGoiTapStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [resMonth, resYear, resGT] = await Promise.all([
        baoCaoService.getDoanhThuTheoThang(thang, nam),
        baoCaoService.getDoanhThu12Thang(nam),
        baoCaoService.getThongKeGoiTap()
      ]);

      if (resMonth.success) setMonthlyReport(resMonth.data);
      if (resYear.success) setYearlyData(resYear.data);
      if (resGT.success) setGoiTapStats(resGT.data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [thang, nam]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const maxRevenueYear = Math.max(...yearlyData.map(d => d.tongDoanhThu || 0), 1);

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter Bar */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Số liệu dựa trên các hóa đơn đã thanh toán trong cơ sở dữ liệu</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Tháng:</label>
              <select
                className="form-control"
                style={{ width: '100px' }}
                value={thang}
                onChange={(e) => setThang(parseInt(e.target.value, 10))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Năm:</label>
              <select
                className="form-control"
                style={{ width: '110px' }}
                value={nam}
                onChange={(e) => setNam(parseInt(e.target.value, 10))}
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Doanh thu tháng đã chọn (Gọi sp_BaoCaoDoanhThuTheoThang) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {formatCurrency(monthlyReport?.TongDoanhThu)}
            </div>
            <div className="stat-label">Doanh thu tháng {thang}/{nam} (Procedure)</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#059669' }}>
              {monthlyReport?.SoGiaoDich || 0}
            </div>
            <div className="stat-label">Số giao dịch thanh toán thành công</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {monthlyReport?.SoGiaoDich ? formatCurrency(monthlyReport.TongDoanhThu / monthlyReport.SoGiaoDich) : 0}
            </div>
            <div className="stat-label">Giá trị trung bình mỗi giao dịch</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu 12 tháng */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#2563eb" />
            <h3 className="card-title">Biểu Đồ Doanh Thu 12 Tháng Trong Năm {nam}</h3>
          </div>
        </div>

        <div style={{ paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '16px', padding: '0 10px', borderBottom: '2px solid #e2e8f0' }}>
            {yearlyData.map((m) => {
              const heightPercent = maxRevenueYear > 0 ? (m.tongDoanhThu / maxRevenueYear) * 100 : 0;
              const isSelected = m.thangSo === thang;

              return (
                <div key={m.thang} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '6px', whiteSpace: 'nowrap', transform: 'rotate(-30deg)', transformOrigin: 'left bottom' }}>
                    {m.tongDoanhThu > 0 ? `${(m.tongDoanhThu / 1000000).toFixed(1)}M` : '0'}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${Math.max(heightPercent, 4)}%`,
                      backgroundColor: isSelected ? '#2563eb' : '#93c5fd',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    title={`${m.thang}/${nam}: ${formatCurrency(m.tongDoanhThu)} (${m.soGiaoDich} giao dịch)`}
                    onClick={() => setThang(m.thangSo)}
                  />
                  <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#2563eb' : '#64748b' }}>
                    {m.thang}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bảng Xếp Hạng Gói Tập Theo Doanh Thu (View vw_ThongKe_GoiTap) */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#f59e0b" />
            <h3 className="card-title">Xếp Hạng Gói Tập Được Đăng Ký Nhiều Nhất</h3>
          </div>
          <span className="badge badge-success">View vw_ThongKe_GoiTap</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Thứ hạng</th>
                <th>Tên Gói Tập</th>
                <th>Thời Hạn</th>
                <th>Đơn Giá</th>
                <th>Số Lượt Đăng Ký</th>
                <th>Ước Tính Doanh Thu</th>
              </tr>
            </thead>
            <tbody>
              {goiTapStats.map((gt, idx) => (
                <tr key={gt.MaGoi}>
                  <td style={{ fontWeight: 700 }}>
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{gt.TenGoi}</td>
                  <td>{gt.ThoiHanThang} tháng</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>{formatCurrency(gt.Gia)}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontWeight: 700 }}>
                      {gt.SoLuotDangKy} lượt
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>
                    {formatCurrency(gt.SoLuotDangKy * gt.Gia)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BaoCao;
