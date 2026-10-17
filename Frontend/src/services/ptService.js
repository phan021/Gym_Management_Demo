import api from './api';

export const ptService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/pt${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/pt/${id}`),
  create: (data) => api.post('/pt', data),
  update: (id, data) => api.put(`/pt/${id}`, data),
  delete: (id) => api.delete(`/pt/${id}`)
};

export default ptService;
