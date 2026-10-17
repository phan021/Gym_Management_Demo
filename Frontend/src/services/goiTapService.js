import api from './api';

export const goiTapService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/goi-tap${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/goi-tap/${id}`),
  create: (data) => api.post('/goi-tap', data),
  update: (id, data) => api.put(`/goi-tap/${id}`, data),
  delete: (id) => api.delete(`/goi-tap/${id}`)
};

export default goiTapService;
