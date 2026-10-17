import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import hoiVienService from '../services/hoiVienService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { formatDate } from '../utils/dateUtils';

export const HoiVien = () => {
  const [hoiViens, setHoiViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected item
  const [selectedHV, setSelectedHV] = useState(null);
  const [detailData, setDetailData] = useState(null);

  // Form state
  const initialFormData = {
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    soDienThoai: '',
    email: '',
    diaChi: '',
    tenDangNhap: '',
    matKhau: '123456'
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchHoiViens = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await hoiVienService.getAll({ search });
      if (res.success) {
        setHoiViens(res.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách hội viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoiViens();
  }, [search]);

  // Open Edit
  const handleOpenEdit = (hv) => {
    setSelectedHV(hv);
    setFormData({
      hoTen: hv.HoTen || '',
      ngaySinh: hv.NgaySinh ? hv.NgaySinh.split('T')[0] : '',
      gioiTinh: hv.GioiTinh || 'Nam',
      soDienThoai: hv.SoDienThoai || '',
      email: hv.Email || '',
      diaChi: hv.DiaChi || ''
    });
    setIsEditOpen(true);
  };

  // Open Detail
  const handleOpenDetail = async (hv) => {
    setSelectedHV(hv);
    setIsDetailOpen(true);
    try {
      const res = await hoiVienService.getById(hv.MaHV);
      if (res.success) {
        setDetailData(res.data);
      }
    } catch (err) {
      setError('Lỗi khi tải chi tiết hội viên: ' + err.message);
    }
  };

  // Open Delete
  const handleOpenDelete = (hv) => {
    setSelectedHV(hv);
    setIsDeleteOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await hoiVienService.create(formData);
      if (res.success) {
        setSuccessMsg('Thêm hội viên mới thành công!');
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchHoiViens();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm hội viên');
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await hoiVienService.update(selectedHV.MaHV, formData);
      if (res.success) {
        setSuccessMsg('Cập nhật thông tin hội viên thành công!');
        setIsEditOpen(false);
        fetchHoiViens();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật');
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await hoiVienService.delete(selectedHV.MaHV);
      if (res.success) {
        setSuccessMsg(res.message || 'Xóa hội viên thành công!');
        setIsDeleteOpen(false);
        fetchHoiViens();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa hội viên');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const columns = [
    {
      header: 'Mã HV',
      accessor: 'MaHV',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaHV}</span>
    },
    {
      header: 'Họ và Tên',
      accessor: 'HoTen',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.HoTen}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {r.GioiTinh} • {r.Tuoi ? `${r.Tuoi} tuổi` : 'Chưa có năm sinh'}
          </div>
        </div>
      )
    },
    {
      header: 'Liên Hệ',
      accessor: 'SoDienThoai',
      render: (r) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div>{r.SoDienThoai}</div>
          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{r.Email || '-'}</div>
        </div>
      )
    },
    {
      header: 'Gói Tập Hiện Tại',
      accessor: 'GoiHienTai',
      render: (r) => (
        r.GoiHienTai ? (
          <span className="badge badge-success">{r.GoiHienTai}</span>
        ) : (
          <span className="badge badge-warning">Chưa có gói</span>
        )
      )
    },
    {
      header: 'Tổng Chi Tiêu',
      accessor: 'TongTienDaChi',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#059669' }}>
          {formatCurrency(r.TongTienDaChi)}
        </span>
      )
    },
    {
      header: 'Tài Khoản',
      accessor: 'TenDangNhap',
      render: (r) => (
        r.TenDangNhap ? (
          <span className="badge badge-info">{r.TenDangNhap}</span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa cấp</span>
        )
      )
    },
    {
      header: 'Thao Tác',
      align: 'right',
      width: '160px',
      render: (r) => (
        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            title="Xem chi tiết"
            onClick={() => handleOpenDetail(r)}
          >
            <Eye size={15} />
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            title="Sửa thông tin"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={15} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa hội viên"
            onClick={() => handleOpenDelete(r)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <UserCheck size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo tên, SĐT, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Thêm Hội Viên</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={hoiViens} 
          loading={loading}
          emptyMessage="Không tìm thấy hội viên nào"
        />
      </div>

      {/* Modal Thêm Hội Viên */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm Hội Viên Mới"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Lưu Hội Viên</button>
          </>
        )}
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.hoTen}
                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                type="tel"
                className="form-control"
                required
                value={formData.soDienThoai}
                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                placeholder="0901234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                value={formData.ngaySinh}
                onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select
                className="form-control"
                value={formData.gioiTinh}
                onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                value={formData.diaChi}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                placeholder="Hà Nội..."
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>
              Cấp tài khoản đăng nhập cho hội viên (Tùy chọn)
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.tenDangNhap}
                  onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                  placeholder="Ví dụ: nguyenvana"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mật khẩu ban đầu</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.matKhau}
                  onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                  placeholder="Mặc định: Gymthattuyet2006@"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Hội Viên */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa Hội Viên #${selectedHV?.MaHV}`}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Cập Nhật</button>
          </>
        )}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.hoTen}
                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                type="tel"
                className="form-control"
                required
                value={formData.soDienThoai}
                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                value={formData.ngaySinh}
                onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select
                className="form-control"
                value={formData.gioiTinh}
                onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                value={formData.diaChi}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Xem Chi Tiết Hội Viên */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Hồ Sơ Chi Tiết: ${selectedHV?.HoTen}`}
        maxWidth="750px"
        footer={(
          <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>Đóng</button>
        )}
      >
        {detailData ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div><b>Mã HV:</b> #{detailData.MaHV}</div>
              <div><b>Giới tính:</b> {detailData.GioiTinh}</div>
              <div><b>Số điện thoại:</b> {detailData.SoDienThoai}</div>
              <div><b>Email:</b> {detailData.Email || 'Chưa cập nhật'}</div>
              <div><b>Địa chỉ:</b> {detailData.DiaChi || 'Chưa cập nhật'}</div>
              <div><b>Tuổi:</b> {detailData.Tuoi ? `${detailData.Tuoi} tuổi` : '-'}</div>
              <div><b>Ngày tham gia:</b> {formatDate(detailData.NgayThamGia)}</div>
              <div><b>Tổng chi tiêu:</b> <span style={{ color: '#059669', fontWeight: 700 }}>{formatCurrency(detailData.TongTienDaChi)}</span></div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Gói tập đã đăng ký</h4>
            {detailData.danhSachDangKy?.length > 0 ? (
              <div style={{ maxHeight: '140px', overflowY: 'auto', marginBottom: '16px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Gói tập</th>
                      <th>Bắt đầu</th>
                      <th>Kết thúc</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.danhSachDangKy.map(dk => (
                      <tr key={dk.MaDK}>
                        <td>{dk.TenGoi}</td>
                        <td>{formatDate(dk.NgayBatDau)}</td>
                        <td>{formatDate(dk.NgayKetThuc)}</td>
                        <td>
                          <span className={`badge ${dk.TrangThai === 'Đang hoạt động' ? 'badge-success' : 'badge-warning'}`}>
                            {dk.TrangThai}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Chưa có đăng ký gói tập nào</p>}

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Lịch tập với PT</h4>
            {detailData.danhSachLichPT?.length > 0 ? (
              <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>HLV (PT)</th>
                      <th>Chuyên môn</th>
                      <th>Ngày tập</th>
                      <th>Giờ</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.danhSachLichPT.map(l => (
                      <tr key={l.MaLich}>
                        <td>{l.TenPT}</td>
                        <td>{l.ChuyenMon}</td>
                        <td>{formatDate(l.NgayTap)}</td>
                        <td>{l.GioBatDau} - {l.GioKetThuc}</td>
                        <td><span className="badge badge-info">{l.TrangThai}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Chưa có lịch hẹn với PT nào</p>}
          </div>
        ) : <p>Đang tải chi tiết...</p>}
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Hội Viên"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy bỏ</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận Xóa</button>
          </>
        )}
      >
        <p style={{ fontSize: '0.95rem', color: '#475569' }}>
          Bạn có chắc chắn muốn xóa hội viên <b>{selectedHV?.HoTen}</b> (#{selectedHV?.MaHV})?
        </p>
        <p style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '10px' }}>
          * Toàn bộ lịch sử đăng ký gói, thanh toán, check-in và lịch PT của hội viên này sẽ được xóa đồng bộ an toàn.
        </p>
      </Modal>
    </div>
  );
};

export default HoiVien;
