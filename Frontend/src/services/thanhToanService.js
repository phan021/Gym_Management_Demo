import api from './api';

export const thanhToanService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/thanh-toan${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/thanh-toan/${id}`),
  create: (data) => api.post('/thanh-toan', data),
  update: (id, data) => api.put(`/thanh-toan/${id}`, data),
  delete: (id) => api.delete(`/thanh-toan/${id}`),
  getMyThanhToan: () => api.get('/thanh-toan/my-thanh-toan')
};

export default thanhToanService;
