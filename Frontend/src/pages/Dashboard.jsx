import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Dumbbell, 
  Activity,
  ArrowRight
} from 'lucide-react';
import baoCaoService from '../services/baoCaoService';

import { formatDate, formatDateTime } from '../utils/dateUtils';

export const Dashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await baoCaoService.getTongQuan();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        <p>Đang tải dữ liệu bảng điều khiển...</p>
      </div>
    );
  }

  const { tongQuan, doanhThuThangHienTai, topGoiTap, giaoDichMoi, checkInMoi } = data || {};

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{tongQuan?.TongHoiVien || 0}</div>
            <div className="stat-label">Tổng số hội viên</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="stat-value">{tongQuan?.GoiDangHoatDong || 0}</div>
            <div className="stat-label">Gói đang hoạt động</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{tongQuan?.CheckInHomNay || 0}</div>
            <div className="stat-label">Lượt check-in hôm nay</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-value">{tongQuan?.DangTapTrongGym || 0}</div>
            <div className="stat-label">Hội viên đang tập</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <Dumbbell size={24} />
          </div>
          <div>
            <div className="stat-value">{tongQuan?.TongPT || 0}</div>
            <div className="stat-label">Huấn luyện viên (PT)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {formatCurrency(tongQuan?.TongDoanhThu)}
            </div>
            <div className="stat-label">Tổng doanh thu hệ thống</div>
          </div>
        </div>
      </div>

      {/* Highlights: Stored Procedure Report & Top Packages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Doanh thu tháng hiện tại qua Procedure */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="#2563eb" />
              <h3 className="card-title">Doanh Thu Tháng {doanhThuThangHienTai?.Thang}/{doanhThuThangHienTai?.Nam}</h3>
            </div>
            <span className="badge badge-info">Stored Procedure</span>
          </div>
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
              {formatCurrency(doanhThuThangHienTai?.TongDoanhThu)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Tổng cộng <b>{doanhThuThangHienTai?.SoGiaoDich || 0}</b> giao dịch thành công trong tháng này.
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ width: '100%', marginTop: '8px' }}
            onClick={() => onNavigate && onNavigate('baocao')}
          >
            <span>Xem chi tiết báo cáo doanh thu</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Thống kê gói tập qua View */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} color="#9333ea" />
              <h3 className="card-title">Gói Tập Phổ Biến</h3>
            </div>
            <span className="badge badge-success">SQL View</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topGoiTap?.slice(0, 4).map((gt) => (
              <div key={gt.MaGoi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{gt.TenGoi}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{gt.ThoiHanThang} tháng • {formatCurrency(gt.Gia)}</div>
                </div>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  {gt.SoLuotDangKy} lượt mua
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity: Thanh Toán & Check-in */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Hóa đơn thanh toán mới */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">Giao Dịch Gần Nhất</h3>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => onNavigate && onNavigate('thanhtoan')}
            >
              Tất cả
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {giaoDichMoi?.map((gd) => (
              <div key={gd.MaTT} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{gd.HoTen}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{gd.TenGoi} • {gd.PhuongThuc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>{formatCurrency(gd.SoTien)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatDateTime(gd.NgayThanhToan)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lượt check-in mới */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">Check-in Gần Đây</h3>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => onNavigate && onNavigate('checkin')}
            >
              Quầy Check-in
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checkInMoi?.map((ci) => (
              <div key={ci.MaCheckIn} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ci.TenHoiVien}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Vào: {formatDateTime(ci.ThoiGianVao)}</div>
                </div>
                <div>
                  {ci.ThoiGianRa ? (
                    <span className="badge badge-secondary" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      Ra lúc {new Date(ci.ThoiGianRa).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      Đang tập
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
