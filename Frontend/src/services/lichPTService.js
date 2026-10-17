import api from './api';

export const lichPTService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/lich-pt${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/lich-pt/${id}`),
  create: (data) => api.post('/lich-pt', data),
  update: (id, data) => api.put(`/lich-pt/${id}`, data),
  delete: (id) => api.delete(`/lich-pt/${id}`),
  getMyLichPT: () => api.get('/lich-pt/my-lich-pt'),
  memberBook: (data) => api.post('/lich-pt/member-book', data),
  memberCancel: (id) => api.put(`/lich-pt/my-lich-pt/${id}/cancel`)
};

export default lichPTService;
