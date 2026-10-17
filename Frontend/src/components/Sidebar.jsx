import React from 'react';
import { 
  Users, 
  Package, 
  Dumbbell, 
  UserCheck, 
  CreditCard, 
  CalendarCheck, 
  BarChart3, 
  User, 
  LayoutDashboard,
  History,
  FileCheck,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ user, activeTab, onSelectTab, onOpenUserProfileModal }) => {
  const isAdmin = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'NHANVIEN';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Dumbbell size={22} />
        </div>
        <div>
          <div className="sidebar-title">GYM MASTER</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Hệ Thống Quản Lý</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <div className="nav-section-title">QUẢN TRỊ VIÊN</div>

            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onSelectTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Tổng quan & Thống kê</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'hoivien' ? 'active' : ''}`}
              onClick={() => onSelectTab('hoivien')}
            >
              <Users size={18} />
              <span>Hội viên</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'goitap' ? 'active' : ''}`}
              onClick={() => onSelectTab('goitap')}
            >
              <Package size={18} />
              <span>Gói tập</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'pt' ? 'active' : ''}`}
              onClick={() => onSelectTab('pt')}
            >
              <Dumbbell size={18} />
              <span>Huấn luyện viên (PT)</span>
            </button>

            <div className="nav-section-title">NGHIỆP VỤ HỘI VIÊN</div>

            <button 
              className={`nav-item ${activeTab === 'dangky' ? 'active' : ''}`}
              onClick={() => onSelectTab('dangky')}
            >
              <FileCheck size={18} />
              <span>Đăng ký gói tập</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'thanhtoan' ? 'active' : ''}`}
              onClick={() => onSelectTab('thanhtoan')}
            >
              <CreditCard size={18} />
              <span>Thanh toán hóa đơn</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'checkin' ? 'active' : ''}`}
              onClick={() => onSelectTab('checkin')}
            >
              <UserCheck size={18} />
              <span>Điểm danh Check-in</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'lichpt' ? 'active' : ''}`}
              onClick={() => onSelectTab('lichpt')}
            >
              <CalendarCheck size={18} />
              <span>Lịch tập với PT</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'baocao' ? 'active' : ''}`}
              onClick={() => onSelectTab('baocao')}
            >
              <BarChart3 size={18} />
              <span>Báo cáo doanh thu</span>
            </button>
          </>
        ) : (
          <>
            <div className="nav-section-title">CỔNG HỘI VIÊN</div>

            <button 
              className={`nav-item ${activeTab === 'member-profile' ? 'active' : ''}`}
              onClick={() => onSelectTab('member-profile')}
            >
              <User size={18} />
              <span>Thông tin cá nhân</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'member-packages' ? 'active' : ''}`}
              onClick={() => onSelectTab('member-packages')}
            >
              <Package size={18} />
              <span>Xem gói tập</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'member-my-packages' ? 'active' : ''}`}
              onClick={() => onSelectTab('member-my-packages')}
            >
              <FileCheck size={18} />
              <span>Gói đã đăng ký</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'member-payments' ? 'active' : ''}`}
              onClick={() => onSelectTab('member-payments')}
            >
              <CreditCard size={18} />
              <span>Lịch sử thanh toán</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'member-checkins' ? 'active' : ''}`}
              onClick={() => onSelectTab('member-checkins')}
            >
              <History size={18} />
              <span>Lịch sử check-in</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'member-pt' ? 'active' : ''}`}
              onClick={() => onSelectTab('member-pt')}
            >
              <CalendarCheck size={18} />
              <span>Xem / Đặt lịch PT</span>
            </button>
          </>
        )}
      </nav>

      {/* Nút tên người dùng ở góc dưới bên trái */}
      <div style={{
        padding: '14px 16px 16px',
        borderTop: '1px solid #1e293b',
        background: '#0b1120',
        marginTop: 'auto'
      }}>
        <button
          type="button"
          onClick={onOpenUserProfileModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            background: 'linear-gradient(145deg, #1e293b, #152033)',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '11px 13px',
            color: '#ffffff',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(145deg, #27354f, #1a273e)';
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(145deg, #1e293b, #152033)';
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.35)';
          }}
          title="Nhấn để cập nhật thông tin cá nhân & đổi mật khẩu"
        >
          {/* Avatar chữ cái đại diện */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {user?.hoTen?.charAt(0) || user?.tenDangNhap?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Họ tên và mã tài khoản */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#f8fafc',
              letterSpacing: '0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '3px',
              lineHeight: '1.25'
            }}>
              {user?.hoTen || user?.tenDangNhap}
            </div>
            <div style={{
              fontSize: '0.74rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              lineHeight: '1'
            }}>
              {isAdmin ? (
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Quản trị viên</span>
              ) : (
                <>
                  <span>Tài khoản:</span>
                  <span style={{
                    color: '#93c5fd',
                    background: 'rgba(59, 130, 246, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(59, 130, 246, 0.25)'
                  }}>
                    {user?.tenDangNhap}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mũi tên chỉ báo */}
          <ChevronRight size={16} color="#64748b" style={{ flexShrink: 0, opacity: 0.8 }} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
