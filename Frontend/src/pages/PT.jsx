import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Edit, Trash2, Phone, Mail, Award, AlertCircle, CheckCircle } from 'lucide-react';
import ptService from '../services/ptService';
import Table from '../components/Table';
import Modal from '../components/Modal';

export const PT = () => {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPT, setSelectedPT] = useState(null);

  const initialFormData = {
    hoTen: '',
    soDienThoai: '',
    email: '',
    chuyenMon: 'Thể hình',
    kinhNghiem: 1,
    luong: '',
    trangThai: 1
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchPTs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ptService.getAll();
      if (res.success) {
        setPts(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách PT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTs();
  }, []);

  const handleOpenEdit = (pt) => {
    setSelectedPT(pt);
    setFormData({
      hoTen: pt.HoTen,
      soDienThoai: pt.SoDienThoai,
      email: pt.Email || '',
      chuyenMon: pt.ChuyenMon,
      kinhNghiem: pt.KinhNghiem,
      luong: pt.Luong || '',
      trangThai: pt.TrangThai ? 1 : 0
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (pt) => {
    setSelectedPT(pt);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await ptService.create(formData);
      if (res.success) {
        setSuccessMsg('Thêm huấn luyện viên (PT) thành công!');
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchPTs();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm PT');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await ptService.update(selectedPT.MaPT, formData);
      if (res.success) {
        setSuccessMsg('Cập nhật thông tin PT thành công!');
        setIsEditOpen(false);
        fetchPTs();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật PT');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await ptService.delete(selectedPT.MaPT);
      if (res.success) {
        setSuccessMsg(res.message || 'Xóa PT thành công!');
        setIsDeleteOpen(false);
        fetchPTs();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa PT');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const columns = [
    {
      header: 'Mã PT',
      accessor: 'MaPT',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaPT}</span>
    },
    {
      header: 'Họ và Tên',
      accessor: 'HoTen',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700 }}>{r.HoTen}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {r.Email || 'Chưa cập nhật email'}
          </div>
        </div>
      )
    },
    {
      header: 'Chuyên Môn',
      accessor: 'ChuyenMon',
      render: (r) => (
        <span className="badge badge-info" style={{ fontWeight: 600 }}>
          {r.ChuyenMon}
        </span>
      )
    },
    {
      header: 'Kinh Nghiệm',
      accessor: 'KinhNghiem',
      render: (r) => (
        <span style={{ fontWeight: 600 }}>{r.KinhNghiem} năm</span>
      )
    },
    {
      header: 'Số Điện Thoại',
      accessor: 'SoDienThoai',
      render: (r) => (
        <span style={{ fontSize: '0.875rem' }}>{r.SoDienThoai}</span>
      )
    },
    {
      header: 'Lương Cơ Bản',
      accessor: 'Luong',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#059669' }}>
          {r.Luong ? formatCurrency(r.Luong) : '-'}
        </span>
      )
    },
    {
      header: 'Số Buổi Tập',
      accessor: 'TongSoBuoiTap',
      render: (r) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div><b>{r.TongSoBuoiTap || 0}</b> buổi được đặt</div>
          <div style={{ color: '#10b981' }}>{r.SoBuoiHoanThanh || 0} hoàn thành</div>
        </div>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: 'TrangThai',
      render: (r) => (
        r.TrangThai ? (
          <span className="badge badge-success">Đang làm việc</span>
        ) : (
          <span className="badge badge-danger">Đã nghỉ</span>
        )
      )
    },
    {
      header: 'Thao Tác',
      align: 'right',
      width: '120px',
      render: (r) => (
        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            title="Sửa thông tin PT"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={15} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa PT"
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
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Đội Ngũ Huấn Luyện Viên (PT)</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Quản lý thông tin huấn luyện viên cá nhân và lịch dạy</p>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Thêm Huấn Luyện Viên</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={pts} 
          loading={loading}
          emptyMessage="Chưa có huấn luyện viên nào"
        />
      </div>

      {/* Modal Thêm PT */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm Huấn Luyện Viên Mới"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Lưu Huấn Luyện Viên</button>
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
                placeholder="Nguyễn Văn PT"
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
                placeholder="0987654321"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="pt@gmail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chuyên môn *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.chuyenMon}
                onChange={(e) => setFormData({ ...formData, chuyenMon: e.target.value })}
                placeholder="Thể hình / Giảm cân / Boxing / Yoga"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kinh nghiệm (năm)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.kinhNghiem}
                onChange={(e) => setFormData({ ...formData, kinhNghiem: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lương thỏa thuận (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="500000"
                className="form-control"
                value={formData.luong}
                onChange={(e) => setFormData({ ...formData, luong: e.target.value })}
                placeholder="10000000"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa PT */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa PT #${selectedPT?.MaPT}`}
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
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chuyên môn *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.chuyenMon}
                onChange={(e) => setFormData({ ...formData, chuyenMon: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kinh nghiệm (năm)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.kinhNghiem}
                onChange={(e) => setFormData({ ...formData, kinhNghiem: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lương thỏa thuận (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="500000"
                className="form-control"
                value={formData.luong}
                onChange={(e) => setFormData({ ...formData, luong: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-control"
                value={formData.trangThai}
                onChange={(e) => setFormData({ ...formData, trangThai: parseInt(e.target.value, 10) })}
              >
                <option value="1">Đang làm việc</option>
                <option value="0">Đã nghỉ việc</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa PT */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Huấn Luyện Viên"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận</button>
          </>
        )}
      >
        <p style={{ color: '#475569' }}>
          Bạn có chắc chắn muốn xóa huấn luyện viên <b>{selectedPT?.HoTen}</b>?
        </p>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
          * Nếu huấn luyện viên này đã có lịch hẹn với hội viên, hệ thống sẽ chuyển sang trạng thái <b>[Đã nghỉ việc]</b> để bảo toàn lịch sử.
        </p>
      </Modal>
    </div>
  );
};

export default PT;
