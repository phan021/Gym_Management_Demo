import api from './api';

export const baoCaoService = {
  getTongQuan: () => api.get('/bao-cao/tong-quan'),
  getDoanhThuTheoThang: (thang, nam) => api.get(`/bao-cao/doanh-thu-thang?thang=${thang}&nam=${nam}`),
  getDoanhThu12Thang: (nam) => api.get(`/bao-cao/doanh-thu-12-thang?nam=${nam}`),
  getThongKeGoiTap: () => api.get('/bao-cao/thong-ke-goi-tap')
};

export default baoCaoService;
