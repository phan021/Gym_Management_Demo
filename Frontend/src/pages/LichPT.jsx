import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Dumbbell,
  Clock,
  User
} from 'lucide-react';
import lichPTService from '../services/lichPTService';
import hoiVienService from '../services/hoiVienService';
import ptService from '../services/ptService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { formatDate } from '../utils/dateUtils';

export const LichPT = () => {
  const [lichPTs, setLichPTs] = useState([]);
  const [hoiViens, setHoiViens] = useState([]);
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLich, setSelectedLich] = useState(null);

  const initialFormData = {
    maHV: '',
    maPT: '',
    ngayTap: new Date().toISOString().split('T')[0],
    gioBatDau: '08:00',
    gioKetThuc: '09:00'
  };
  const [formData, setFormData] = useState(initialFormData);

  const [editFormData, setEditFormData] = useState({
    trangThai: 'Đã đặt',
    ngayTap: '',
    gioBatDau: '',
    gioKetThuc: '',
    maPT: ''
  });

  const fetchLichPTs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await lichPTService.getAll({ search, trangThai: trangThaiFilter });
      if (res.success) {
        setLichPTs(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải lịch tập PT');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [resHV, resPT] = await Promise.all([
        hoiVienService.getAll(),
        ptService.getAll({ activeOnly: 'true' })
      ]);
      if (resHV.success) setHoiViens(resHV.data);
      if (resPT.success) setPts(resPT.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLichPTs();
  }, [search, trangThaiFilter]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const handleOpenEdit = (lich) => {
    setSelectedLich(lich);
    setEditFormData({
      trangThai: lich.TrangThai,
      ngayTap: lich.NgayTap ? lich.NgayTap.split('T')[0] : '',
      gioBatDau: lich.GioBatDau || '',
      gioKetThuc: lich.GioKetThuc || '',
      maPT: lich.MaPT
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (lich) => {
    setSelectedLich(lich);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await lichPTService.create(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Đặt lịch PT thành công!');
        setIsCreateOpen(false);
        setFormData(initialFormData);
        fetchLichPTs();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi đặt lịch PT');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await lichPTService.update(selectedLich.MaLich, editFormData);
      if (res.success) {
        setSuccessMsg('Cập nhật lịch tập PT thành công!');
        setIsEditOpen(false);
        fetchLichPTs();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật lịch');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await lichPTService.delete(selectedLich.MaLich);
      if (res.success) {
        setSuccessMsg('Đã xóa buổi tập PT!');
        setIsDeleteOpen(false);
        fetchLichPTs();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa lịch');
    }
  };

  const columns = [
    {
      header: 'Mã Lịch',
      accessor: 'MaLich',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaLich}</span>
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
      header: 'Huấn Luyện Viên (PT)',
      accessor: 'TenPT',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>{r.TenPT}</div>
          <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
            {r.ChuyenMon}
          </span>
        </div>
      )
    },
    {
      header: 'Ngày & Giờ Tập',
      accessor: 'NgayTap',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatDate(r.NgayTap)}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {r.GioBatDau} - {r.GioKetThuc}
          </div>
        </div>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: 'TrangThai',
      render: (r) => {
        if (r.TrangThai === 'Hoàn thành') return <span className="badge badge-success">Hoàn thành</span>;
        if (r.TrangThai === 'Đã đặt') return <span className="badge badge-info">Đã đặt lịch</span>;
        return <span className="badge badge-danger">Đã hủy</span>;
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
            title="Sửa / Đổi trạng thái"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={15} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa lịch"
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
                placeholder="Tìm theo hội viên, PT, chuyên môn..."
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
              <option value="Đã đặt">Đã đặt</option>
              <option value="Hoàn thành">Hoàn thành</option>
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
            <span>Đặt Lịch Tập PT Mới</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={lichPTs} 
          loading={loading}
          emptyMessage="Chưa có lịch hẹn với PT nào"
        />
      </div>

      {/* Modal Đặt Lịch PT Mới */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Đặt Lịch Tập Cùng Huấn Luyện Viên (PT)"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreateSubmit}>Xác Nhận Đặt Lịch</button>
          </>
        )}
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Hội viên đăng ký tập *</label>
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
            <label className="form-label">Chọn Huấn luyện viên (PT) *</label>
            <select
              className="form-control"
              required
              value={formData.maPT}
              onChange={(e) => setFormData({ ...formData, maPT: e.target.value })}
            >
              <option value="">-- Chọn PT --</option>
              {pts.map(pt => (
                <option key={pt.MaPT} value={pt.MaPT}>
                  {pt.HoTen} - Chuyên môn: {pt.ChuyenMon} ({pt.KinhNghiem} năm KN)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày tập luyện *</label>
            <input
              type="date"
              className="form-control"
              required
              value={formData.ngayTap}
              onChange={(e) => setFormData({ ...formData, ngayTap: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Giờ bắt đầu *</label>
              <input
                type="time"
                className="form-control"
                required
                value={formData.gioBatDau}
                onChange={(e) => setFormData({ ...formData, gioBatDau: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ kết thúc *</label>
              <input
                type="time"
                className="form-control"
                required
                value={formData.gioKetThuc}
                onChange={(e) => setFormData({ ...formData, gioKetThuc: e.target.value })}
              />
            </div>
          </div>

          <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', fontSize: '0.85rem', color: '#1e40af' }}>
            * Hệ thống tự động kiểm tra chống trùng lịch giữa Huấn luyện viên và Hội viên bằng <b>Stored Procedure sp_DatLichPT</b>.
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Lịch PT */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa Lịch PT #${selectedLich?.MaLich}`}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Cập Nhật</button>
          </>
        )}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Trạng thái buổi tập</label>
            <select
              className="form-control"
              value={editFormData.trangThai}
              onChange={(e) => setEditFormData({ ...editFormData, trangThai: e.target.value })}
            >
              <option value="Đã đặt">Đã đặt</option>
              <option value="Hoàn thành">Hoàn thành (Đã tập xong)</option>
              <option value="Đã hủy">Đã hủy lịch</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Đổi Huấn luyện viên</label>
            <select
              className="form-control"
              value={editFormData.maPT}
              onChange={(e) => setEditFormData({ ...editFormData, maPT: e.target.value })}
            >
              {pts.map(pt => (
                <option key={pt.MaPT} value={pt.MaPT}>
                  {pt.HoTen} - {pt.ChuyenMon}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày tập</label>
            <input
              type="date"
              className="form-control"
              value={editFormData.ngayTap}
              onChange={(e) => setEditFormData({ ...editFormData, ngayTap: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Giờ bắt đầu</label>
              <input
                type="time"
                className="form-control"
                value={editFormData.gioBatDau}
                onChange={(e) => setEditFormData({ ...editFormData, gioBatDau: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ kết thúc</label>
              <input
                type="time"
                className="form-control"
                value={editFormData.gioKetThuc}
                onChange={(e) => setEditFormData({ ...editFormData, gioKetThuc: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Xóa Lịch PT */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Buổi Tập PT"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận Xóa</button>
          </>
        )}
      >
        <p style={{ color: '#475569' }}>
          Bạn có chắc chắn muốn xóa lịch tập của hội viên <b>{selectedLich?.TenHoiVien}</b> và HLV <b>{selectedLich?.TenPT}</b> vào ngày <b>{selectedLich?.NgayTap?.split('T')[0]}</b> này không?
        </p>
      </Modal>
    </div>
  );
};

export default LichPT;
