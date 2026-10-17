import api from './api';

export const hoiVienService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/hoi-vien${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/hoi-vien/${id}`),
  create: (data) => api.post('/hoi-vien', data),
  update: (id, data) => api.put(`/hoi-vien/${id}`, data),
  delete: (id) => api.delete(`/hoi-vien/${id}`),
  getMyProfile: () => api.get('/hoi-vien/my-profile'),
  updateMyProfile: (data) => api.put('/hoi-vien/my-profile', data)
};

export default hoiVienService;
