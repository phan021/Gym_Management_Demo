import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import goiTapService from '../services/goiTapService';
import Table from '../components/Table';
import Modal from '../components/Modal';

export const GoiTap = () => {
  const [goiTaps, setGoiTaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoi, setSelectedGoi] = useState(null);

  const initialFormData = {
    tenGoi: '',
    thoiHanThang: 1,
    gia: '',
    moTa: '',
    trangThai: 1
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchGoiTaps = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await goiTapService.getAll();
      if (res.success) {
        setGoiTaps(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách gói tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoiTaps();
  }, []);

  const handleOpenEdit = (gt) => {
    setSelectedGoi(gt);
    setFormData({
      tenGoi: gt.TenGoi,
      thoiHanThang: gt.ThoiHanThang,
      gia: gt.Gia,
      moTa: gt.MoTa || '',
      trangThai: gt.TrangThai ? 1 : 0
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (gt) => {
    setSelectedGoi(gt);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await goiTapService.create(formData);
      if (res.success) {
        setSuccessMsg('Thêm gói tập thành công!');
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchGoiTaps();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm gói tập');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await goiTapService.update(selectedGoi.MaGoi, formData);
      if (res.success) {
        setSuccessMsg('Cập nhật gói tập thành công!');
        setIsEditOpen(false);
        fetchGoiTaps();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật gói tập');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await goiTapService.delete(selectedGoi.MaGoi);
      if (res.success) {
        setSuccessMsg(res.message || 'Xóa gói tập thành công!');
        setIsDeleteOpen(false);
        fetchGoiTaps();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa gói tập');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const columns = [
    {
      header: 'Mã Gói',
      accessor: 'MaGoi',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaGoi}</span>
    },
    {
      header: 'Tên Gói Tập',
      accessor: 'TenGoi',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.TenGoi}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.MoTa || 'Không có mô tả'}</div>
        </div>
      )
    },
    {
      header: 'Thời Hạn',
      accessor: 'ThoiHanThang',
      render: (r) => (
        <span style={{ fontWeight: 600 }}>{r.ThoiHanThang} tháng</span>
      )
    },
    {
      header: 'Đơn Giá',
      accessor: 'Gia',
      render: (r) => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
          {formatCurrency(r.Gia)}
        </span>
      )
    },
    {
      header: 'Lượt Đăng Ký',
      accessor: 'SoLuotDangKy',
      render: (r) => (
        <span className="badge badge-info">{r.SoLuotDangKy || 0} lượt</span>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: 'TrangThai',
      render: (r) => (
        r.TrangThai ? (
          <span className="badge badge-success">Đang áp dụng</span>
        ) : (
          <span className="badge badge-danger">Ngừng áp dụng</span>
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
            title="Sửa gói tập"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={15} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa gói tập"
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Danh Sách Các Gói Tập</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Bảng giá và thời hạn thẻ tập tại phòng gym</p>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Thêm Gói Tập</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={goiTaps} 
          loading={loading}
          emptyMessage="Chưa có gói tập nào"
        />
      </div>

      {/* Modal Thêm Gói Tập */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm Gói Tập Mới"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Lưu Gói Tập</button>
          </>
        )}
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Tên gói tập *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.tenGoi}
              onChange={(e) => setFormData({ ...formData, tenGoi: e.target.value })}
              placeholder="Ví dụ: Gói VIP 12 tháng"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Thời hạn (tháng) *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                required
                value={formData.thoiHanThang}
                onChange={(e) => setFormData({ ...formData, thoiHanThang: parseInt(e.target.value, 10) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá tiền (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="10000"
                className="form-control"
                required
                value={formData.gia}
                onChange={(e) => setFormData({ ...formData, gia: e.target.value })}
                placeholder="Ví dụ: 1500000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả quyền lợi gói</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              placeholder="Quyền lợi khu vực tập, tủ đồ cá nhân..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-control"
              value={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: parseInt(e.target.value, 10) })}
            >
              <option value="1">Đang hoạt động (cho phép đăng ký)</option>
              <option value="0">Ngừng áp dụng</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Gói Tập */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa Gói Tập #${selectedGoi?.MaGoi}`}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Cập Nhật</button>
          </>
        )}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Tên gói tập *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.tenGoi}
              onChange={(e) => setFormData({ ...formData, tenGoi: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Thời hạn (tháng) *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                required
                value={formData.thoiHanThang}
                onChange={(e) => setFormData({ ...formData, thoiHanThang: parseInt(e.target.value, 10) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá tiền (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="10000"
                className="form-control"
                required
                value={formData.gia}
                onChange={(e) => setFormData({ ...formData, gia: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-control"
              value={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: parseInt(e.target.value, 10) })}
            >
              <option value="1">Đang hoạt động</option>
              <option value="0">Ngừng áp dụng</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa Gói Tập */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Gói Tập"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận</button>
          </>
        )}
      >
        <p style={{ color: '#475569' }}>
          Bạn có chắc chắn muốn xóa gói tập <b>{selectedGoi?.TenGoi}</b>?
        </p>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
          * Nếu gói tập này đã có hội viên đăng ký, hệ thống sẽ tự động chuyển sang trạng thái <b>[Ngừng áp dụng]</b> để bảo toàn lịch sử giao dịch.
        </p>
      </Modal>
    </div>
  );
};

export default GoiTap;
