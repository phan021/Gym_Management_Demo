import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  FileCheck, 
  CreditCard, 
  History, 
  CalendarCheck, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Activity,
  XCircle,
  Calendar
} from 'lucide-react';
import hoiVienService from '../services/hoiVienService';
import goiTapService from '../services/goiTapService';
import dangKyService from '../services/dangKyService';
import thanhToanService from '../services/thanhToanService';
import checkInService from '../services/checkInService';
import lichPTService from '../services/lichPTService';
import ptService from '../services/ptService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { formatDate, formatDateTime, getWeekDays } from '../utils/dateUtils';

export const MemberPortal = ({ activeTab, onSelectTab }) => {
  const [profile, setProfile] = useState(null);
  const [packages, setPackages] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [myCheckIns, setMyCheckIns] = useState([]);
  const [myLichPT, setMyLichPT] = useState([]);
  const [pts, setPts] = useState([]);

  // Tuần đang xem thống kê check-in
  const [weekOffset, setWeekOffset] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isRegisterPackageOpen, setIsRegisterPackageOpen] = useState(false);
  const [isBookPTOpen, setIsBookPTOpen] = useState(false);
  const [selectedPackageToBuy, setSelectedPackageToBuy] = useState(null);

  // Forms
  const [buyPackageForm, setBuyPackageForm] = useState({
    ngayBatDau: new Date().toISOString().split('T')[0],
    tuDongThanhToan: true,
    phuongThuc: 'Chuyển khoản'
  });

  const [bookPTForm, setBookPTForm] = useState({
    maPT: '',
    ngayTap: new Date().toISOString().split('T')[0],
    gioBatDau: '08:00',
    gioKetThuc: '09:00'
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'member-profile') {
        const [resProfile, resCI, resLich] = await Promise.all([
          hoiVienService.getMyProfile(),
          checkInService.getMyCheckIn(),
          lichPTService.getMyLichPT()
        ]);
        if (resProfile.success) setProfile(resProfile.data);
        if (resCI.success) setMyCheckIns(resCI.data);
        if (resLich.success) setMyLichPT(resLich.data);
      } else if (activeTab === 'member-packages') {
        const [resGoi, resMyGoi] = await Promise.all([
          goiTapService.getAll({ activeOnly: 'true' }),
          dangKyService.getMyDangKy()
        ]);
        if (resGoi.success) setPackages(resGoi.data);
        if (resMyGoi.success) setMyPackages(resMyGoi.data);
      } else if (activeTab === 'member-my-packages') {
        const res = await dangKyService.getMyDangKy();
        if (res.success) setMyPackages(res.data);
      } else if (activeTab === 'member-payments') {
        const res = await thanhToanService.getMyThanhToan();
        if (res.success) setMyPayments(res.data);
      } else if (activeTab === 'member-checkins') {
        const res = await checkInService.getMyCheckIn();
        if (res.success) setMyCheckIns(res.data);
      } else if (activeTab === 'member-pt') {
        const [resLich, resPT] = await Promise.all([
          lichPTService.getMyLichPT(),
          ptService.getAll({ activeOnly: 'true' })
        ]);
        if (resLich.success) setMyLichPT(resLich.data);
        if (resPT.success) setPts(resPT.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Tìm gói đang hoạt động lớn nhất hiện tại của hội viên
  const getActiveLargestPackage = () => {
    const activePkgs = myPackages.filter(p => p.TrangThai === 'Đang hoạt động');
    if (activePkgs.length === 0) return null;
    return activePkgs.reduce((prev, current) => (Number(prev.Gia) > Number(current.Gia)) ? prev : current);
  };

  // Bấm Mua gói tập với kiểm tra gói lớn hơn
  const handleSelectPackageToBuy = (pkg) => {
    const activePkg = getActiveLargestPackage();
    if (activePkg) {
      if (Number(pkg.Gia) < Number(activePkg.Gia) || Number(pkg.ThoiHanThang) < Number(activePkg.ThoiHanThang)) {
        setError(`Bạn đang có gói tập lớn hơn (${activePkg.TenGoi} - ${formatCurrency(activePkg.Gia)}) đang còn hiệu lực. Không thể đăng ký gói tập nhỏ hơn!`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setError(''), 4000);
        return;
      }
    }
    setError('');
    setSelectedPackageToBuy(pkg);
    setIsRegisterPackageOpen(true);
  };

  // Hủy gói tập đã đăng ký
  const handleCancelPackage = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy gói tập này không?')) return;
    try {
      setError('');
      const res = await dangKyService.cancel(id);
      if (res.success) {
        setSuccessMsg('Đã hủy gói tập thành công!');
        loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi hủy gói tập');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Submit Mua gói tập
  const handleRegisterPackageSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await dangKyService.memberRegister({
        maGoi: selectedPackageToBuy.MaGoi,
        ngayBatDau: buyPackageForm.ngayBatDau,
        tuDongThanhToan: buyPackageForm.tuDongThanhToan,
        phuongThuc: buyPackageForm.phuongThuc
      });
      if (res.success) {
        setSuccessMsg(res.message || 'Đăng ký gói tập thành công. Gói cũ đã được tự động hủy.');
        setIsRegisterPackageOpen(false);
        await loadData();
        onSelectTab('member-my-packages');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi đăng ký gói');
    }
  };

  // Submit Đặt lịch PT
  const handleBookPTSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await lichPTService.memberBook(bookPTForm);
      if (res.success) {
        setSuccessMsg(res.message || 'Đặt lịch PT thành công!');
        setIsBookPTOpen(false);
        loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi đặt lịch');
    }
  };

  // Hủy lịch PT
  const handleCancelPT = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch tập này?')) return;
    try {
      setError('');
      const res = await lichPTService.memberCancel(id);
      if (res.success) {
        setSuccessMsg('Đã hủy lịch tập thành công!');
        loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi hủy lịch');
    }
  };

  // Tính toán dữ liệu check-in trong tuần đang chọn
  const getSelectedWeekData = () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weekOffset * 7));
    const weekInfo = getWeekDays(targetDate);

    let totalMinutes = 0;
    let totalSessions = 0;

    const daysWithCheckIn = weekInfo.days.map(d => {
      // Tìm các lần checkin trong ngày d.dateString
      const matched = myCheckIns.filter(ci => {
        if (!ci.ThoiGianVao) return false;
        const ciDate = ci.ThoiGianVao.split('T')[0];
        return ciDate === d.dateString;
      });

      if (matched.length > 0) {
        const lastCI = matched[0];
        const minutes = lastCI.SoPhutTap || 0;
        totalMinutes += minutes;
        totalSessions += matched.length;

        return {
          ...d,
          hasCheckIn: true,
          thoiGianVao: lastCI.ThoiGianVao,
          thoiGianRa: lastCI.ThoiGianRa,
          soPhutTap: minutes
        };
      }

      return {
        ...d,
        hasCheckIn: false,
        soPhutTap: 0
      };
    });

    return {
      weekInfo,
      days: daysWithCheckIn,
      totalMinutes,
      totalSessions
    };
  };

  const weekData = getSelectedWeekData();

  return (
    <div>
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. XEM THÔNG TIN CÁ NHÂN */}
      {activeTab === 'member-profile' && (
        <div>
          {/* Card Thông tin tổng quan hội viên (Bỏ nút cập nhật phía trên theo yêu cầu) */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Hồ Sơ Cá Nhân Hội Viên</h3>
              <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                Hội viên chính thức
              </span>
            </div>

            {profile ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700 }}>
                      {profile.HoTen?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{profile.HoTen}</h2>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Mã Hội Viên: #{profile.MaHV} • Tên đăng nhập: <b>{profile.TenDangNhap}</b>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={15} color="#64748b" />
                      <span><b>Số điện thoại:</b> {profile.SoDienThoai}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={15} color="#64748b" />
                      <span><b>Email:</b> {profile.Email || 'Chưa cập nhật'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="#64748b" />
                      <span><b>Ngày sinh:</b> {formatDate(profile.NgaySinh)} ({profile.GioiTinh})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} color="#64748b" />
                      <span><b>Địa chỉ:</b> {profile.DiaChi || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: '16px' }}>
                    <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981', width: '42px', height: '42px' }}>
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <div className="stat-value" style={{ color: '#059669', fontSize: '1.3rem' }}>
                        {formatCurrency(profile.TongTienDaChi)}
                      </div>
                      <div className="stat-label">Tổng chi tiêu gói tập</div>
                    </div>
                  </div>

                  <div className="stat-card" style={{ borderLeft: '4px solid #2563eb', padding: '16px' }}>
                    <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb', width: '42px', height: '42px' }}>
                      <CalendarCheck size={20} />
                    </div>
                    <div>
                      <div className="stat-value" style={{ fontSize: '1.15rem' }}>
                        {formatDate(profile.NgayThamGia)}
                      </div>
                      <div className="stat-label">Ngày gia nhập phòng gym</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : <p>Đang tải hồ sơ...</p>}
          </div>

          {/* 2 BẢNG SONG SONG: THỐNG KÊ CHECK-IN TRONG TUẦN (BÊN TRÁI) VÀ LỊCH TẬP (BÊN PHẢI) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
            {/* BẢNG BÊN TRÁI: THỐNG KÊ CHECK-IN TRONG TUẦN */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 className="card-title">Thống Kê Điểm Danh Trong Tuần</h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {formatDate(weekData.weekInfo.monday)} ➜ {formatDate(weekData.weekInfo.sunday)}
                  </div>
                </div>

                {/* Nút điều chỉnh tuần */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setWeekOffset(weekOffset - 1)}
                    title="Tuần trước"
                    style={{ padding: '4px 8px' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setWeekOffset(0)}
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  >
                    Hiện tại
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setWeekOffset(weekOffset + 1)}
                    title="Tuần sau"
                    style={{ padding: '4px 8px' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Tóm tắt chỉ số tuần */}
              <div style={{ display: 'flex', gap: '12px', background: '#eff6ff', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', color: '#1e40af' }}>
                <div>Số buổi tập: <b>{weekData.totalSessions} buổi</b></div>
                <div>•</div>
                <div>Tổng thời gian: <b>{weekData.totalMinutes} phút</b></div>
              </div>

              {/* Danh sách 7 ngày trong tuần */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weekData.days.map((d, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: d.hasCheckIn ? '#f0fdf4' : '#f8fafc',
                      border: d.hasCheckIn ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, width: '65px', fontSize: '0.85rem', color: d.hasCheckIn ? '#166534' : '#475569' }}>
                        {d.dayName}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {d.displayDate}
                      </span>
                    </div>

                    <div>
                      {d.hasCheckIn ? (
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            {d.thoiGianRa ? `${d.soPhutTap} phút` : 'Đang tập'}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            Vào: {d.thoiGianVao ? new Date(d.thoiGianVao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Nghỉ tập</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BẢNG BÊN PHẢI: LỊCH TẬP VỚI PT CỦA HỘI VIÊN */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Lịch Tập Với Huấn Luyện Viên</h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Các buổi tập cá nhân (PT) của bạn</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onSelectTab('member-pt')}
                >
                  <Plus size={14} />
                  <span>Đặt lịch mới</span>
                </button>
              </div>

              {myLichPT.length > 0 ? (
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Ngày tập</th>
                        <th>Giờ</th>
                        <th>Huấn luyện viên</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLichPT.slice(0, 8).map(l => (
                        <tr key={l.MaLich}>
                          <td style={{ fontWeight: 600 }}>{formatDate(l.NgayTap)}</td>
                          <td style={{ fontSize: '0.8rem' }}>{l.GioBatDau} - {l.GioKetThuc}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{l.TenPT}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.ChuyenMon}</div>
                          </td>
                          <td>
                            <span className={`badge ${l.TrangThai === 'Hoàn thành' ? 'badge-success' : l.TrangThai === 'Đã đặt' ? 'badge-info' : 'badge-danger'}`}>
                              {l.TrangThai}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  <CalendarCheck size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.875rem' }}>Bạn chưa có lịch tập nào với Huấn luyện viên</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. XEM GÓI TẬP */}
      {activeTab === 'member-packages' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Danh Sách Các Gói Tập Tại Phòng Gym</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Hãy chọn gói tập phù hợp để bắt đầu rèn luyện thể lực
            </p>
            {getActiveLargestPackage() && (
              <div style={{ marginTop: '10px', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.85rem', color: '#065f46' }}>
                ⭐ <b>Gói hiện tại đang dùng:</b> {getActiveLargestPackage().TenGoi} ({getActiveLargestPackage().ThoiHanThang} tháng - {formatCurrency(getActiveLargestPackage().Gia)}).
                Hệ thống chỉ cho phép nâng cấp lên gói tập có thời hạn và giá trị lớn hơn.
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {packages.map((gt) => {
              const activePkg = getActiveLargestPackage();
              const isSmaller = activePkg && (Number(gt.Gia) < Number(activePkg.Gia) || Number(gt.ThoiHanThang) < Number(activePkg.ThoiHanThang));

              return (
                <div 
                  key={gt.MaGoi} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    borderTop: isSmaller ? '4px solid #cbd5e1' : '4px solid #2563eb',
                    opacity: isSmaller ? 0.75 : 1
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>{gt.TenGoi}</h4>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginBottom: '12px' }}>
                      {formatCurrency(gt.Gia)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                      Thời hạn: <b>{gt.ThoiHanThang} tháng</b>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', minHeight: '48px' }}>
                      {gt.MoTa || 'Tập luyện không giới hạn khung giờ, sử dụng đầy đủ trang thiết bị hiện đại.'}
                    </p>
                  </div>

                  <button 
                    className={`btn ${isSmaller ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={() => handleSelectPackageToBuy(gt)}
                  >
                    <Plus size={16} />
                    <span>{isSmaller ? 'Không thể đăng ký' : 'Đăng Ký Gói Này'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. XEM GÓI ĐÃ ĐĂNG KÝ */}
      {activeTab === 'member-my-packages' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Các Gói Tập Đã Đăng Ký</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onSelectTab('member-packages')}>
              <span>Xem thêm gói khác</span>
            </button>
          </div>

          <Table 
            columns={[
              { header: 'Mã ĐK', accessor: 'MaDK', render: r => <b style={{ color: '#2563eb' }}>#{r.MaDK}</b> },
              { header: 'Tên Gói', accessor: 'TenGoi', render: r => <b>{r.TenGoi}</b> },
              { header: 'Giá Tiền', accessor: 'Gia', render: r => <span style={{ color: '#059669', fontWeight: 600 }}>{formatCurrency(r.Gia)}</span> },
              { 
                header: 'Thời Hạn', 
                accessor: 'NgayBatDau', 
                render: r => `${formatDate(r.NgayBatDau)} ➜ ${formatDate(r.NgayKetThuc)}` 
              },
              { 
                header: 'Số Ngày Còn Lại', 
                accessor: 'SoNgayConLai', 
                render: r => {
                  if (r.TrangThai === 'Đã hủy') return <span style={{ color: '#94a3b8' }}>-</span>;
                  const d = r.SoNgayConLai;
                  if (d < 0) return <span className="badge badge-danger">Đã hết hạn</span>;
                  return <span className="badge badge-success">Còn {d} ngày</span>;
                }
              },
              { 
                header: 'Trạng Thái', 
                accessor: 'TrangThai', 
                render: r => (
                  <span className={`badge ${r.TrangThai === 'Đang hoạt động' ? 'badge-success' : r.TrangThai === 'Đã hủy' ? 'badge-danger' : 'badge-warning'}`}>
                    {r.TrangThai}
                  </span>
                )
              },
              {
                header: 'Thao Tác',
                align: 'right',
                width: '120px',
                render: r => (
                  r.TrangThai === 'Đang hoạt động' ? (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelPackage(r.MaDK)}
                      title="Hủy gói tập này"
                      style={{ gap: '4px' }}
                    >
                      <XCircle size={14} />
                      <span>Hủy gói</span>
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {r.TrangThai === 'Đã hủy' ? 'Đã hủy' : '-'}
                    </span>
                  )
                )
              }
            ]}
            data={myPackages}
            loading={loading}
            emptyMessage="Bạn chưa đăng ký gói tập nào"
          />
        </div>
      )}

      {/* 4. XEM LỊCH SỬ THANH TOÁN */}
      {activeTab === 'member-payments' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lịch Sử Thanh Toán Của Bạn</h3>
          </div>

          <Table 
            columns={[
              { header: 'Mã Hóa Đơn', accessor: 'MaTT', render: r => <b style={{ color: '#2563eb' }}>#{r.MaTT}</b> },
              { header: 'Gói Tập', accessor: 'TenGoi', render: r => <b>{r.TenGoi}</b> },
              { header: 'Số Tiền', accessor: 'SoTien', render: r => <b style={{ color: '#059669' }}>{formatCurrency(r.SoTien)}</b> },
              { header: 'Phương Thức', accessor: 'PhuongThuc', render: r => <span className="badge badge-info">{r.PhuongThuc}</span> },
              { header: 'Thời Gian', accessor: 'NgayThanhToan', render: r => formatDateTime(r.NgayThanhToan) },
              { 
                header: 'Trạng Thái', 
                accessor: 'TrangThai', 
                render: r => (
                  <span className={`badge ${r.TrangThai === 'Đang thanh toán' || r.TrangThai === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'}`}>
                    {r.TrangThai}
                  </span>
                )
              }
            ]}
            data={myPayments}
            loading={loading}
            emptyMessage="Chưa có giao dịch thanh toán nào"
          />
        </div>
      )}

      {/* 5. XEM LỊCH SỬ CHECK-IN */}
      {activeTab === 'member-checkins' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lịch Sử Điểm Danh Check-in</h3>
          </div>

          <Table 
            columns={[
              { header: 'Mã Lượt', accessor: 'MaCheckIn', render: r => <b style={{ color: '#2563eb' }}>#{r.MaCheckIn}</b> },
              { header: 'Giờ Vào', accessor: 'ThoiGianVao', render: r => formatDateTime(r.ThoiGianVao) },
              { 
                header: 'Giờ Ra', 
                accessor: 'ThoiGianRa', 
                render: r => r.ThoiGianRa ? formatDateTime(r.ThoiGianRa) : <span className="badge badge-success">Đang tập</span>
              },
              { header: 'Thời Lượng', accessor: 'SoPhutTap', render: r => <b>{r.SoPhutTap || 0} phút</b> }
            ]}
            data={myCheckIns}
            loading={loading}
            emptyMessage="Bạn chưa có lượt check-in nào"
          />
        </div>
      )}

      {/* 6. XEM / ĐẶT LỊCH PT */}
      {activeTab === 'member-pt' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Lịch Tập Với Huấn Luyện Viên Cá Nhân (PT)</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Xem các buổi tập đã đặt hoặc đăng ký thêm lịch tập mới</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setIsBookPTOpen(true)}
            >
              <Plus size={16} />
              <span>Đặt Lịch Với PT</span>
            </button>
          </div>

          <Table 
            columns={[
              { header: 'Mã Lịch', accessor: 'MaLich', render: r => <b style={{ color: '#2563eb' }}>#{r.MaLich}</b> },
              { 
                header: 'Huấn Luyện Viên', 
                accessor: 'TenPT', 
                render: r => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.TenPT}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.ChuyenMon} • SĐT: {r.SdtPT}</div>
                  </div>
                )
              },
              { 
                header: 'Thời Gian', 
                accessor: 'NgayTap', 
                render: r => (
                  <div>
                    <b>{formatDate(r.NgayTap)}</b>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.GioBatDau} - {r.GioKetThuc}</div>
                  </div>
                )
              },
              { 
                header: 'Trạng Thái', 
                accessor: 'TrangThai', 
                render: r => {
                  if (r.TrangThai === 'Hoàn thành') return <span className="badge badge-success">Hoàn thành</span>;
                  if (r.TrangThai === 'Đã đặt') return <span className="badge badge-info">Đã đặt</span>;
                  return <span className="badge badge-danger">Đã hủy</span>;
                }
              },
              {
                header: 'Thao Tác',
                align: 'right',
                width: '100px',
                render: r => (
                  r.TrangThai === 'Đã đặt' ? (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelPT(r.MaLich)}
                      title="Hủy lịch này"
                    >
                      <XCircle size={14} />
                      <span>Hủy</span>
                    </button>
                  ) : '-'
                )
              }
            ]}
            data={myLichPT}
            loading={loading}
            emptyMessage="Bạn chưa có lịch hẹn nào với Huấn luyện viên"
          />
        </div>
      )}

      {/* Modal Mua Gói Tập */}
      <Modal
        isOpen={isRegisterPackageOpen}
        onClose={() => setIsRegisterPackageOpen(false)}
        title={`Đăng Ký: ${selectedPackageToBuy?.TenGoi}`}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsRegisterPackageOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleRegisterPackageSubmit}>Xác Nhận Đăng Ký</button>
          </>
        )}
      >
        <form onSubmit={handleRegisterPackageSubmit}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedPackageToBuy?.TenGoi}</div>
            <div style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.25rem' }}>{formatCurrency(selectedPackageToBuy?.Gia)}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Thời hạn: {selectedPackageToBuy?.ThoiHanThang} tháng</div>
          </div>

          {getActiveLargestPackage() && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#2563eb" />
              <span>Gói tập hiện tại <b>({getActiveLargestPackage().TenGoi})</b> sẽ tự động được hủy khi bạn đăng ký gói mới này.</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Ngày bắt đầu tập</label>
            <input
              type="date"
              className="form-control"
              value={buyPackageForm.ngayBatDau}
              onChange={(e) => setBuyPackageForm({ ...buyPackageForm, ngayBatDau: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phương thức thanh toán</label>
            <select
              className="form-control"
              value={buyPackageForm.phuongThuc}
              onChange={(e) => setBuyPackageForm({ ...buyPackageForm, phuongThuc: e.target.value })}
            >
              <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
              <option value="Tiền mặt">Thanh toán tiền mặt tại quầy</option>
              <option value="Thẻ">Thẻ ATM / Visa</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Đặt Lịch PT */}
      <Modal
        isOpen={isBookPTOpen}
        onClose={() => setIsBookPTOpen(false)}
        title="Đặt Lịch Tập Cùng Huấn Luyện Viên"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsBookPTOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleBookPTSubmit}>Xác Nhận Đặt Lịch</button>
          </>
        )}
      >
        <form onSubmit={handleBookPTSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn Huấn luyện viên (PT) *</label>
            <select
              className="form-control"
              required
              value={bookPTForm.maPT}
              onChange={(e) => setBookPTForm({ ...bookPTForm, maPT: e.target.value })}
            >
              <option value="">-- Chọn Huấn Luyện Viên --</option>
              {pts.map(pt => (
                <option key={pt.MaPT} value={pt.MaPT}>
                  {pt.HoTen} - Chuyên môn: {pt.ChuyenMon} ({pt.KinhNghiem} năm KN)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày tập *</label>
            <input
              type="date"
              className="form-control"
              required
              value={bookPTForm.ngayTap}
              onChange={(e) => setBookPTForm({ ...bookPTForm, ngayTap: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Giờ bắt đầu *</label>
              <input
                type="time"
                className="form-control"
                required
                value={bookPTForm.gioBatDau}
                onChange={(e) => setBookPTForm({ ...bookPTForm, gioBatDau: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ kết thúc *</label>
              <input
                type="time"
                className="form-control"
                required
                value={bookPTForm.gioKetThuc}
                onChange={(e) => setBookPTForm({ ...bookPTForm, gioKetThuc: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MemberPortal;
