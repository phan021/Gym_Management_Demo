import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  DollarSign
} from 'lucide-react';
import thanhToanService from '../services/thanhToanService';
import dangKyService from '../services/dangKyService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { formatDateTime } from '../utils/dateUtils';

export const ThanhToan = () => {
  const [thanhToans, setThanhToans] = useState([]);
  const [dangKys, setDangKys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [phuongThucFilter, setPhuongThucFilter] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTT, setSelectedTT] = useState(null);

  const initialFormData = {
    maDK: '',
    soTien: '',
    phuongThuc: 'Chuyển khoản',
    trangThai: 'Đã thanh toán'
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchThanhToans = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await thanhToanService.getAll({ 
        search, 
        phuongThuc: phuongThucFilter, 
        trangThai: trangThaiFilter 
      });
      if (res.success) {
        setThanhToans(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const loadDangKys = async () => {
    try {
      const res = await dangKyService.getAll();
      if (res.success) setDangKys(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThanhToans();
  }, [search, phuongThucFilter, trangThaiFilter]);

  useEffect(() => {
    loadDangKys();
  }, []);

  const handleOpenEdit = (tt) => {
    setSelectedTT(tt);
    setFormData({
      soTien: tt.SoTien,
      phuongThuc: tt.PhuongThuc,
      trangThai: tt.TrangThai
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (tt) => {
    setSelectedTT(tt);
    setIsDeleteOpen(true);
  };

  const handleSelectDK = (e) => {
    const dkId = e.target.value;
    const dk = dangKys.find(d => d.MaDK === parseInt(dkId, 10));
    setFormData({
      ...formData,
      maDK: dkId,
      soTien: dk ? dk.Gia : formData.soTien
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await thanhToanService.create(formData);
      if (res.success) {
        setSuccessMsg('Tạo hóa đơn thanh toán thành công!');
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchThanhToans();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo hóa đơn');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await thanhToanService.update(selectedTT.MaTT, formData);
      if (res.success) {
        setSuccessMsg('Cập nhật hóa đơn thanh toán thành công!');
        setIsEditOpen(false);
        fetchThanhToans();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật thanh toán');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await thanhToanService.delete(selectedTT.MaTT);
      if (res.success) {
        setSuccessMsg('Đã xóa hóa đơn thanh toán!');
        setIsDeleteOpen(false);
        fetchThanhToans();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa hóa đơn');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const columns = [
    {
      header: 'Mã TT',
      accessor: 'MaTT',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaTT}</span>
    },
    {
      header: 'Hội Viên',
      accessor: 'TenHoiVien',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700 }}>{r.TenHoiVien}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>SĐT: {r.SdtHoiVien}</div>
        </div>
      )
    },
    {
      header: 'Gói Tập (Mã ĐK)',
      accessor: 'TenGoi',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.TenGoi}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Đăng ký #{r.MaDK}</div>
        </div>
      )
    },
    {
      header: 'Số Tiền',
      accessor: 'SoTien',
      render: (r) => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
          {formatCurrency(r.SoTien)}
        </span>
      )
    },
    {
      header: 'Phương Thức',
      accessor: 'PhuongThuc',
      render: (r) => (
        <span className="badge badge-info">{r.PhuongThuc}</span>
      )
    },
    {
      header: 'Thời Gian',
      accessor: 'NgayThanhToan',
      render: (r) => (
        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
          {formatDateTime(r.NgayThanhToan)}
        </span>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: 'TrangThai',
      render: (r) => {
        if (r.TrangThai === 'Đã thanh toán') return <span className="badge badge-success">{r.TrangThai}</span>;
        if (r.TrangThai === 'Chờ thanh toán') return <span className="badge badge-warning">{r.TrangThai}</span>;
        return <span className="badge badge-danger">{r.TrangThai}</span>;
      }
    },
    {
      header: 'Thao Tác',
      align: 'right',
      width: '120px',
      render: (r) => (
        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            title="Sửa thanh toán"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={15} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa hóa đơn"
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
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo hội viên, SĐT, gói..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '160px' }}
              value={phuongThucFilter}
              onChange={(e) => setPhuongThucFilter(e.target.value)}
            >
              <option value="">Tất cả hình thức</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Thẻ">Thẻ</option>
            </select>

            <select
              className="form-control"
              style={{ width: '160px' }}
              value={trangThaiFilter}
              onChange={(e) => setTrangThaiFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Chờ thanh toán">Chờ thanh toán</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Tạo Hóa Đơn Thanh Toán</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={thanhToans} 
          loading={loading}
          emptyMessage="Chưa có dữ liệu thanh toán"
        />
      </div>

      {/* Modal Tạo Thanh Toán */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Hóa Đơn Thanh Toán"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Xác Nhận Thu Tiền</button>
          </>
        )}
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn bản ghi đăng ký gói *</label>
            <select
              className="form-control"
              required
              value={formData.maDK}
              onChange={handleSelectDK}
            >
              <option value="">-- Chọn đăng ký gói của hội viên --</option>
              {dangKys.map(dk => (
                <option key={dk.MaDK} value={dk.MaDK}>
                  #{dk.MaDK} - {dk.TenHoiVien} ({dk.TenGoi} - {formatCurrency(dk.Gia)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Số tiền thanh toán (VNĐ) *</label>
              <input
                type="number"
                min="1000"
                step="1000"
                className="form-control"
                required
                value={formData.soTien}
                onChange={(e) => setFormData({ ...formData, soTien: e.target.value })}
                placeholder="Nhập số tiền..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phương thức *</label>
              <select
                className="form-control"
                value={formData.phuongThuc}
                onChange={(e) => setFormData({ ...formData, phuongThuc: e.target.value })}
              >
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Thẻ">Thẻ</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái thanh toán</label>
            <select
              className="form-control"
              value={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
            >
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Chờ thanh toán">Chờ thanh toán</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Thanh Toán */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa Hóa Đơn #${selectedTT?.MaTT}`}
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
              <label className="form-label">Số tiền (VNĐ) *</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.soTien}
                onChange={(e) => setFormData({ ...formData, soTien: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phương thức</label>
              <select
                className="form-control"
                value={formData.phuongThuc}
                onChange={(e) => setFormData({ ...formData, phuongThuc: e.target.value })}
              >
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Thẻ">Thẻ</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái thanh toán</label>
            <select
              className="form-control"
              value={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
            >
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Chờ thanh toán">Chờ thanh toán</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa Thanh Toán */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Hóa Đơn"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận Xóa</button>
          </>
        )}
      >
        <p style={{ color: '#475569' }}>
          Bạn có chắc chắn muốn xóa hóa đơn thanh toán <b>{selectedTT?.MaTT}</b> trị giá <b>{formatCurrency(selectedTT?.SoTien)}</b> của hội viên <b>{selectedTT?.TenHoiVien}</b>?
        </p>
      </Modal>
    </div>
  );
};

export default ThanhToan;
