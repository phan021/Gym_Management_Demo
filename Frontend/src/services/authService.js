import api from './api';

export const authService = {
  login: async (taiKhoan, matKhau) => {
    const res = await api.post('/auth/login', { taiKhoan, matKhau });
    if (res.success && res.data) {
      localStorage.setItem('gym_token', res.data.token);
      localStorage.setItem('gym_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  register: async (registerData) => {
    const res = await api.post('/auth/register', registerData);
    if (res.success && res.data) {
      localStorage.setItem('gym_token', res.data.token);
      localStorage.setItem('gym_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('gym_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getMe: () => api.get('/auth/me'),
  changePassword: (matKhauCu, matKhauMoi, xacNhanMatKhau) => api.post('/auth/change-password', { matKhauCu, matKhauMoi, xacNhanMatKhau }),
  getAllAccounts: () => api.get('/auth/accounts')
};

export default authService;
