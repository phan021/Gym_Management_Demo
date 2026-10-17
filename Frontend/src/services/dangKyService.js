import api from './api';

export const dangKyService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/dang-ky${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/dang-ky/${id}`),
  create: (data) => api.post('/dang-ky', data),
  update: (id, data) => api.put(`/dang-ky/${id}`, data),
  delete: (id) => api.delete(`/dang-ky/${id}`),
  getMyDangKy: () => api.get('/dang-ky/my-dang-ky'),
  memberRegister: (data) => api.post('/dang-ky/member-register', data),
  cancel: (id) => api.put(`/dang-ky/${id}/cancel`)
};

export default dangKyService;
