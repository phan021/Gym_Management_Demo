import React, { useState, useEffect } from 'react';
import { User, Lock, LogOut, CheckCircle, AlertCircle, Save, KeyRound } from 'lucide-react';
import hoiVienService from '../services/hoiVienService';
import authService from '../services/authService';
import Modal from './Modal';

export const UserProfileModal = ({ isOpen, onClose, user, onLogout, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

  // Form Thông tin cá nhân
  const [infoForm, setInfoForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    diaChi: ''
  });

  // Form Đổi mật khẩu
  const [passForm, setPassForm] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhau: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setActiveTab('info');
      if (user?.vaiTro === 'HOIVIEN') {
        hoiVienService.getMyProfile().then(res => {
          if (res.success && res.data) {
            setInfoForm({
              hoTen: res.data.HoTen || '',
              soDienThoai: res.data.SoDienThoai || '',
              email: res.data.Email || '',
              ngaySinh: res.data.NgaySinh ? res.data.NgaySinh.split('T')[0] : '',
              gioiTinh: res.data.GioiTinh || 'Nam',
              diaChi: res.data.DiaChi || ''
            });
          }
        }).catch(console.error);
      } else {
        setInfoForm({
          hoTen: user?.hoTen || '',
          soDienThoai: user?.soDienThoai || '',
          email: user?.email || '',
          ngaySinh: '',
          gioiTinh: 'Nam',
          diaChi: ''
        });
      }
    }
  }, [isOpen, user]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (user?.vaiTro === 'HOIVIEN') {
        const res = await hoiVienService.updateMyProfile(infoForm);
        if (res.success) {
          setSuccess('Cập nhật thông tin cá nhân thành công!');
          if (onProfileUpdated) onProfileUpdated();
        }
      } else {
        setSuccess('Thông tin tài khoản đã được lưu!');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passForm.matKhauMoi !== passForm.xacNhanMatKhau) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    if (passForm.matKhauMoi.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(
        passForm.matKhauCu,
        passForm.matKhauMoi,
        passForm.xacNhanMatKhau
      );
      if (res.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setPassForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
      }
    } catch (err) {
      setError(err.message || 'Mật khẩu hiện tại không chính xác');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ Sơ & Cài Đặt Tài Khoản"
      maxWidth="600px"
      footer={(
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={16} />
            <span>Đăng Xuất</span>
          </button>

          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      )}
    >
      {/* Tabs Chuyển đổi */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('info'); setError(''); setSuccess(''); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'info' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'info' ? '#ffffff' : '#64748b'
          }}
        >
          <User size={16} />
          <span>Thông Tin Người Dùng</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeTab === 'password' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'password' ? '#ffffff' : '#64748b'
          }}
        >
          <KeyRound size={16} />
          <span>Đổi Mật Khẩu</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: THAY ĐỔI THÔNG TIN NGƯỜI DÙNG */}
      {activeTab === 'info' && (
        <form onSubmit={handleUpdateInfo}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                type="text"
                className="form-control"
                required
                value={infoForm.hoTen}
                onChange={(e) => setInfoForm({ ...infoForm, hoTen: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                type="tel"
                className="form-control"
                required
                value={infoForm.soDienThoai}
                onChange={(e) => setInfoForm({ ...infoForm, soDienThoai: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                value={infoForm.ngaySinh}
                onChange={(e) => setInfoForm({ ...infoForm, ngaySinh: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select
                className="form-control"
                value={infoForm.gioiTinh}
                onChange={(e) => setInfoForm({ ...infoForm, gioiTinh: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                value={infoForm.diaChi}
                onChange={(e) => setInfoForm({ ...infoForm, diaChi: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi Thông Tin'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CẬP NHẬT MẬT KHẨU MỚI */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Mật khẩu hiện tại *</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="Nhập mật khẩu hiện tại..."
              value={passForm.matKhauCu}
              onChange={(e) => setPassForm({ ...passForm, matKhauCu: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu mới *</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="Tối thiểu 6 ký tự..."
              value={passForm.matKhauMoi}
              onChange={(e) => setPassForm({ ...passForm, matKhauMoi: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="Nhập lại mật khẩu mới..."
              value={passForm.xacNhanMatKhau}
              onChange={(e) => setPassForm({ ...passForm, xacNhanMatKhau: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <KeyRound size={16} />
              <span>{loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default UserProfileModal;
