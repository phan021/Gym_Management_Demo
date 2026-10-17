import React, { useState, useEffect } from 'react';
import authService from './services/authService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserProfileModal from './components/UserProfileModal';

// Admin Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HoiVien from './pages/HoiVien';
import GoiTap from './pages/GoiTap';
import PT from './pages/PT';
import DangKyGoi from './pages/DangKyGoi';
import ThanhToan from './pages/ThanhToan';
import CheckIn from './pages/CheckIn';
import LichPT from './pages/LichPT';
import BaoCao from './pages/BaoCao';

// Member Portal
import MemberPortal from './pages/MemberPortal';

export const App = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('');
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const isAdmin = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'NHANVIEN';

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('member-profile');
      }
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleProfileUpdated = () => {
    authService.getMe().then(res => {
      if (res.success && res.data) {
        const updated = {
          ...user,
          hoTen: res.data.HoTen || user.hoTen,
          email: res.data.Email || user.email,
          soDienThoai: res.data.SoDienThoai || user.soDienThoai
        };
        localStorage.setItem('gym_user', JSON.stringify(updated));
        setUser(updated);
      }
    }).catch(console.error);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const tabTitles = {
    'dashboard': 'Bảng Điều Khiển & Thống Kê',
    'hoivien': 'Quản Lý Hội Viên',
    'goitap': 'Quản Lý Gói Tập',
    'pt': 'Quản Lý Huấn Luyện Viên (PT)',
    'dangky': 'Đăng Ký Gói Tập',
    'thanhtoan': 'Thanh Toán Hóa Đơn',
    'checkin': 'Quản Lý Check-In & Điểm Danh',
    'lichpt': 'Quản Lý Lịch Tập PT',
    'baocao': 'Báo Cáo Doanh Thu',
    'member-profile': 'Thông Tin Cá Nhân Hội Viên',
    'member-packages': 'Danh Sách Gói Tập',
    'member-my-packages': 'Gói Tập Đã Đăng Ký',
    'member-payments': 'Lịch Sử Giao Dịch Thanh Toán',
    'member-checkins': 'Lịch Sử Điểm Danh Check-in',
    'member-pt': 'Lịch Tập Với Huấn Luyện Viên (PT)'
  };

  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
        case 'hoivien':
          return <HoiVien />;
        case 'goitap':
          return <GoiTap />;
        case 'pt':
          return <PT />;
        case 'dangky':
          return <DangKyGoi />;
        case 'thanhtoan':
          return <ThanhToan />;
        case 'checkin':
          return <CheckIn />;
        case 'lichpt':
          return <LichPT />;
        case 'baocao':
          return <BaoCao />;
        default:
          return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      }
    } else {
      // Hội viên
      return (
        <MemberPortal 
          activeTab={activeTab} 
          onSelectTab={(tab) => setActiveTab(tab)} 
        />
      );
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
      />

      <div className="main-content">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          activeTabName={tabTitles[activeTab]} 
        />

        <main className="content-body">
          {renderContent()}
        </main>
      </div>

      {/* Modal Cập Nhật Thông Tin & Đổi Mật Khẩu & Đăng Xuất */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={user}
        onLogout={handleLogout}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

export default App;
