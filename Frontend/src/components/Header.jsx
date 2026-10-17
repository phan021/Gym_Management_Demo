import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';

export const Header = ({ user, onLogout, activeTabName }) => {
  const isAdmin = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'NHANVIEN';

  return (
    <header className="top-header">
      <div className="header-left">
        <h2 className="page-title">{activeTabName || 'Quản Lý Phòng Gym'}</h2>
      </div>

      <div className="header-right">
        <div className="user-badge">
          <div className="user-avatar">
            {isAdmin ? <Shield size={16} /> : <User size={16} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.hoTen || user?.tenDangNhap}</div>
            <span className={`role-tag ${isAdmin ? 'role-admin' : 'role-member'}`}>
              {isAdmin ? 'Quản trị viên' : 'Hội viên'}
            </span>
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onLogout}
          title="Đăng xuất"
          style={{ gap: '6px' }}
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
