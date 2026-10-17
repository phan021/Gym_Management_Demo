import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Calendar
} from 'lucide-react';
import dangKyService from '../services/dangKyService';
import hoiVienService from '../services/hoiVienService';
import goiTapService from '../services/goiTapService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { formatDate } from '../utils/dateUtils';

export const DangKyGoi = () => {
  const [dangKys, setDangKys] = useState([]);
  const [hoiViens, setHoiViens] = useState([]);
  const [goiTaps, setGoiTaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDK, setSelectedDK] = useState(null);

  const initialFormData = {
    maHV: '',
    maGoi: '',
    ngayBatDau: new Date().toISOString().split('T')[0],
    tuDongThanhToan: true,
    phuongThuc: 'Chuyển khoản'
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchDangKys = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dangKyService.getAll({ search, trangThai: trangThaiFilter });
      if (res.success) {
        setDangKys(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [resHV, resGT] = await Promise.all([
        hoiVienService.getAll(),
        goiTapService.getAll({ activeOnly: 'true' })
      ]);
      if (resHV.success) setHoiViens(resHV.data);
      if (resGT.success) setGoiTaps(resGT.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDangKys();
  }, [search, trangThaiFilter]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const handleOpenEdit = (dk) => {
    setSelectedDK(dk);
    setFormData({
      ngayBatDau: dk.NgayBatDau ? dk.NgayBatDau.split('T')[0] : '',
      ngayKetThuc: dk.NgayKetThuc ? dk.NgayKetThuc.split('T')[0] : '',
      trangThai: dk.TrangThai
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (dk) => {
    setSelectedDK(dk);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await dangKyService.create(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Đăng ký gói tập thành công!');
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchDangKys();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo đăng ký');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await dangKyService.update(selectedDK.MaDK, formData);
      if (res.success) {
        setSuccessMsg('Cập nhật đăng ký gói thành công!');
        setIsEditOpen(false);
        fetchDangKys();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật đăng ký');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await dangKyService.delete(selectedDK.MaDK);
      if (res.success) {
        setSuccessMsg('Đã xóa bản ghi đăng ký gói tập!');
        setIsDeleteOpen(false);
        fetchDangKys();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa đăng ký');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const columns = [
    {
      header: 'Mã ĐK',
      accessor: 'MaDK',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaDK}</span>
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
      header: 'Gói Tập Đăng Ký',
      accessor: 'TenGoi',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.TenGoi}</div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
            {formatCurrency(r.Gia)}
          </div>
        </div>
      )
    },
    {
      header: 'Thời Hạn Áp Dụng',
      accessor: 'NgayBatDau',
      render: (r) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div>Từ: {formatDate(r.NgayBatDau)}</div>
          <div>Đến: <b>{formatDate(r.NgayKetThuc)}</b></div>
        </div>
      )
    },
    {
      header: 'Còn Lại',
      accessor: 'SoNgayConLai',
      render: (r) => {
        const days = r.SoNgayConLai;
        if (days === null || days === undefined) return '-';
        if (days < 0) return <span className="badge badge-danger">Đã hết hạn</span>;
        if (days <= 7) return <span className="badge badge-warning">Còn {days} ngày</span>;
        return <span className="badge badge-success">Còn {days} ngày</span>;
      }
    },
    {
      header: 'Trạng Thái Gói',
      accessor: 'TrangThai',
      render: (r) => {
        if (r.TrangThai === 'Đang hoạt động') return <span className="badge badge-success">{r.TrangThai}</span>;
        if (r.TrangThai === 'Hết hạn') return <span className="badge badge-warning">{r.TrangThai}</span>;
        return <span className="badge badge-danger">{r.TrangThai}</span>;
      }
    },
    {
      header: 'Thanh Toán',
      accessor: 'TrangThaiThanhToan',
      render: (r) => {
        if (r.TrangThaiThanhToan === 'Đã thanh toán') return <span className="badge badge-success">Đã thanh toán</span>;
        if (r.TrangThaiThanhToan === 'Chờ thanh toán') return <span className="badge badge-warning">Chờ thanh toán</span>;
        return <span className="badge badge-danger">Chưa thanh toán</span>;
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
            title="Sửa đăng ký"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={15} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa đăng ký"
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
                placeholder="Tìm hội viên, SĐT, gói..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '180px' }}
              value={trangThaiFilter}
              onChange={(e) => setTrangThaiFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Hết hạn">Hết hạn</option>
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
            <span>Đăng Ký Gói Cho Hội Viên</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={dangKys} 
          loading={loading}
          emptyMessage="Không có bản ghi đăng ký nào"
        />
      </div>

      {/* Modal Đăng Ký Mới */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Đăng Ký Gói Tập Cho Hội Viên"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Xác Nhận Đăng Ký</button>
          </>
        )}
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn hội viên *</label>
            <select
              className="form-control"
              required
              value={formData.maHV}
              onChange={(e) => setFormData({ ...formData, maHV: e.target.value })}
            >
              <option value="">-- Chọn hội viên --</option>
              {hoiViens.map(hv => (
                <option key={hv.MaHV} value={hv.MaHV}>
                  #{hv.MaHV} - {hv.HoTen} ({hv.SoDienThoai})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Chọn gói tập *</label>
            <select
              className="form-control"
              required
              value={formData.maGoi}
              onChange={(e) => setFormData({ ...formData, maGoi: e.target.value })}
            >
              <option value="">-- Chọn gói tập --</option>
              {goiTaps.map(gt => (
                <option key={gt.MaGoi} value={gt.MaGoi}>
                  {gt.TenGoi} - {gt.ThoiHanThang} tháng ({formatCurrency(gt.Gia)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày bắt đầu hiệu lực *</label>
            <input
              type="date"
              className="form-control"
              required
              value={formData.ngayBatDau}
              onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '16px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#1e40af' }}>
              <input
                type="checkbox"
                checked={formData.tuDongThanhToan}
                onChange={(e) => setFormData({ ...formData, tuDongThanhToan: e.target.checked })}
              />
              <span>Tạo hóa đơn & thanh toán ngay (Transaction an toàn)</span>
            </label>

            {formData.tuDongThanhToan && (
              <div style={{ marginTop: '12px' }}>
                <label className="form-label" style={{ color: '#1e40af' }}>Phương thức thanh toán</label>
                <select
                  className="form-control"
                  value={formData.phuongThuc}
                  onChange={(e) => setFormData({ ...formData, phuongThuc: e.target.value })}
                >
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Thẻ">Thẻ ngân hàng</option>
                </select>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Đăng Ký */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa Đăng Ký #${selectedDK?.MaDK}`}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Cập Nhật</button>
          </>
        )}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Ngày bắt đầu</label>
            <input
              type="date"
              className="form-control"
              value={formData.ngayBatDau}
              onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ngày kết thúc</label>
            <input
              type="date"
              className="form-control"
              value={formData.ngayKetThuc}
              onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái đăng ký</label>
            <select
              className="form-control"
              value={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
            >
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Hết hạn">Hết hạn</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa Đăng Ký */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Đăng Ký Gói Tập"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận Xóa</button>
          </>
        )}
      >
        <p style={{ color: '#475569' }}>
          Bạn có chắc chắn muốn xóa bản ghi đăng ký gói <b>{selectedDK?.TenGoi}</b> của hội viên <b>{selectedDK?.TenHoiVien}</b>?
        </p>
        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>
          * Hóa đơn thanh toán liên quan đến gói này cũng sẽ được xóa đồng thời.
        </p>
      </Modal>
    </div>
  );
};

export default DangKyGoi;
