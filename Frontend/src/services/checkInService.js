import api from './api';

export const checkInService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/check-in${query ? `?${query}` : ''}`);
  },
  create: (data) => api.post('/check-in', data),
  checkOut: (id) => api.put(`/check-in/${id}/checkout`),
  update: (id, data) => api.put(`/check-in/${id}`, data),
  delete: (id) => api.delete(`/check-in/${id}`),
  getMyCheckIn: () => api.get('/check-in/my-checkin')
};

export default checkInService;
