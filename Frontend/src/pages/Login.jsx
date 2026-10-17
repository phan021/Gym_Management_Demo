import React, { useState } from 'react';
import { Dumbbell, User, Lock, Mail, Phone, ArrowRight, AlertCircle, CheckCircle, UserPlus, LogIn } from 'lucide-react';
import authService from '../services/authService';

export const Login = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form Đăng nhập
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');

  // Form Đăng ký (Hội viên)
  const [regForm, setRegForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: '',
    gioiTinh: 'Nam',
    diaChi: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý Đăng nhập
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authService.login(taiKhoan, matKhau);
      if (res.success) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      setError(err.message || 'Tên đăng nhập / Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng ký
  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (regForm.matKhau !== regForm.xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (regForm.matKhau.length < 6) {
      setError('Mật khẩu phải có độ dài từ 6 ký tự trở lên!');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register(regForm);
      if (res.success) {
        setSuccess(res.message || 'Đăng ký thành công!');
        // Sau 1.5s tự động vào app bằng token vừa nhận
        setTimeout(() => {
          onLoginSuccess(res.data.user);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      background: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 100%)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isRegisterMode ? '520px' : '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '14px',
            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)'
          }}>
            <Dumbbell size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>QUẢN LÝ PHÒNG GYM</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
            {isRegisterMode ? 'Đăng ký tài khoản dành riêng cho Hội viên' : 'Đăng nhập hệ thống quản lý phòng gym'}
          </p>
        </div>

        {/* Chuyển đổi Đăng nhập / Đăng ký */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              backgroundColor: !isRegisterMode ? '#ffffff' : 'transparent',
              color: !isRegisterMode ? '#2563eb' : '#64748b',
              boxShadow: !isRegisterMode ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <LogIn size={16} />
            <span>ĐĂNG NHẬP</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              backgroundColor: isRegisterMode ? '#ffffff' : 'transparent',
              color: isRegisterMode ? '#2563eb' : '#64748b',
              boxShadow: isRegisterMode ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <UserPlus size={16} />
            <span>ĐĂNG KÝ HỘI VIÊN</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* FORM ĐĂNG NHẬP */}
        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Tài khoản (Tên đăng nhập hoặc Email)</label>
              <div className="search-input-wrap">
                <User size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: na01 hoặc vananh@gmail.com"
                  value={taiKhoan}
                  onChange={(e) => setTaiKhoan(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Mật khẩu</label>
              <div className="search-input-wrap">
                <Lock size={18} className="search-icon" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu..."
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : (
                <>
                  <span>ĐĂNG NHẬP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORM ĐĂNG KÝ HỘI VIÊN */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <div className="search-input-wrap">
                <User size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn Anh"
                  value={regForm.hoTen}
                  onChange={(e) => setRegForm({ ...regForm, hoTen: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <div className="search-input-wrap">
                  <Mail size={18} className="search-icon" />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@gmail.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại *</label>
                <div className="search-input-wrap">
                  <Phone size={18} className="search-icon" />
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="0901234567"
                    value={regForm.soDienThoai}
                    onChange={(e) => setRegForm({ ...regForm, soDienThoai: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mật khẩu *</label>
                <div className="search-input-wrap">
                  <Lock size={18} className="search-icon" />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Tối thiểu 6 ký tự"
                    value={regForm.matKhau}
                    onChange={(e) => setRegForm({ ...regForm, matKhau: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Xác minh mật khẩu *</label>
                <div className="search-input-wrap">
                  <Lock size={18} className="search-icon" />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu"
                    value={regForm.xacNhanMatKhau}
                    onChange={(e) => setRegForm({ ...regForm, xacNhanMatKhau: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{
              background: '#eff6ff',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#1e40af',
              marginBottom: '20px'
            }}>
              💡 <b>Lưu ý:</b> Hệ thống sẽ tự động tạo tên đăng nhập cho bạn theo quy tắc (ví dụ: <b>na01</b>). Sau khi đăng ký, bạn có thể đăng nhập bằng <b>Tên đăng nhập</b> hoặc <b>Email</b>.
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : (
                <>
                  <span>XÁC NHẬN ĐĂNG KÝ</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
