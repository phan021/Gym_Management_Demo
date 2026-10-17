import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  LogOut, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Clock
} from 'lucide-react';
import checkInService from '../services/checkInService';
import hoiVienService from '../services/hoiVienService';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { formatDateTime } from '../utils/dateUtils';

export const CheckIn = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [hoiViens, setHoiViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dangTapFilter, setDangTapFilter] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedHVCheckIn, setSelectedHVCheckIn] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCI, setSelectedCI] = useState(null);

  const [editFormData, setEditFormData] = useState({
    thoiGianVao: '',
    thoiGianRa: ''
  });

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await checkInService.getAll({ 
        search, 
        dangTap: dangTapFilter ? 'true' : undefined 
      });
      if (res.success) {
        setCheckIns(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách check-in');
    } finally {
      setLoading(false);
    }
  };

  const loadHoiViens = async () => {
    try {
      const res = await hoiVienService.getAll();
      if (res.success) setHoiViens(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, [search, dangTapFilter]);

  useEffect(() => {
    loadHoiViens();
  }, []);

  const handleQuickCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedHVCheckIn) {
      setError('Vui lòng chọn hội viên để check-in');
      return;
    }

    try {
      setError('');
      const res = await checkInService.create({ maHV: selectedHVCheckIn });
      if (res.success) {
        setSuccessMsg(res.message || 'Check-in thành công!');
        setSelectedHVCheckIn('');
        fetchCheckIns();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi check-in');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      setError('');
      const res = await checkInService.checkOut(id);
      if (res.success) {
        setSuccessMsg('Check-out thành công cho hội viên!');
        fetchCheckIns();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi check-out');
    }
  };

  const handleOpenEdit = (ci) => {
    setSelectedCI(ci);
    setEditFormData({
      thoiGianVao: ci.ThoiGianVao ? ci.ThoiGianVao.slice(0, 19) : '',
      thoiGianRa: ci.ThoiGianRa ? ci.ThoiGianRa.slice(0, 19) : ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (ci) => {
    setSelectedCI(ci);
    setIsDeleteOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await checkInService.update(selectedCI.MaCheckIn, editFormData);
      if (res.success) {
        setSuccessMsg('Cập nhật lượt check-in thành công!');
        setIsEditOpen(false);
        fetchCheckIns();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setError('');
      const res = await checkInService.delete(selectedCI.MaCheckIn);
      if (res.success) {
        setSuccessMsg('Đã xóa bản ghi check-in!');
        setIsDeleteOpen(false);
        fetchCheckIns();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi xóa bản ghi');
    }
  };

  const columns = [
    {
      header: 'Mã CI',
      accessor: 'MaCheckIn',
      width: '80px',
      render: (r) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{r.MaCheckIn}</span>
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
      header: 'Thời Gian Vào',
      accessor: 'ThoiGianVao',
      render: (r) => (
        <span style={{ fontSize: '0.85rem' }}>{formatDateTime(r.ThoiGianVao)}</span>
      )
    },
    {
      header: 'Thời Gian Ra',
      accessor: 'ThoiGianRa',
      render: (r) => (
        r.ThoiGianRa ? (
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{formatDateTime(r.ThoiGianRa)}</span>
        ) : (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> Đang tập
          </span>
        )
      )
    },
    {
      header: 'Thời Lượng Tập',
      accessor: 'SoPhutTap',
      render: (r) => (
        <span style={{ fontWeight: 600 }}>{r.SoPhutTap || 0} phút</span>
      )
    },
    {
      header: 'Thao Tác',
      align: 'right',
      width: '180px',
      render: (r) => (
        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
          {!r.ThoiGianRa && (
            <button 
              className="btn btn-warning btn-sm" 
              style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}
              title="Ghi nhận giờ ra"
              onClick={() => handleCheckOut(r.MaCheckIn)}
            >
              <LogOut size={14} />
              <span>Check-out</span>
            </button>
          )}
          <button 
            className="btn btn-secondary btn-sm" 
            title="Sửa bản ghi"
            onClick={() => handleOpenEdit(r)}
          >
            <Edit size={14} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            title="Xóa bản ghi"
            onClick={() => handleOpenDelete(r)}
          >
            <Trash2 size={14} />
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

      {/* Quầy Check-in nhanh */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff, #f8fafc)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} color="#2563eb" />
            <h3 className="card-title">Quầy Điểm Danh Hội Viên Vào Phòng Tập</h3>
          </div>
          <span className="badge badge-info">Stored Procedure sp_CheckInHoiVien</span>
        </div>

        <form onSubmit={handleQuickCheckIn} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label className="form-label">Chọn hội viên quẹt thẻ / check-in:</label>
            <select
              className="form-control"
              value={selectedHVCheckIn}
              onChange={(e) => setSelectedHVCheckIn(e.target.value)}
            >
              <option value="">-- Chọn hoặc tìm hội viên --</option>
              {hoiViens.map(hv => (
                <option key={hv.MaHV} value={hv.MaHV}>
                  #{hv.MaHV} - {hv.HoTen} ({hv.SoDienThoai}) {hv.GoiHienTai ? `[${hv.GoiHienTai}]` : '[Chưa có gói]'}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 700 }}>
            <UserCheck size={18} />
            <span>XÁC NHẬN CHECK-IN</span>
          </button>
        </form>
      </div>

      {/* Danh sách lịch sử Check-in */}
      <div className="card">
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Tìm hội viên, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
              <input
                type="checkbox"
                checked={dangTapFilter}
                onChange={(e) => setDangTapFilter(e.target.checked)}
              />
              <span>Chỉ xem người đang tập (Chưa ra)</span>
            </label>
          </div>
        </div>

        <Table 
          columns={columns} 
          data={checkIns} 
          loading={loading}
          emptyMessage="Chưa có lượt check-in nào"
        />
      </div>

      {/* Modal Sửa Check-in */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Chỉnh Sửa Lượt Check-in #${selectedCI?.MaCheckIn}`}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>Cập Nhật</button>
          </>
        )}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Thời gian vào</label>
            <input
              type="datetime-local"
              className="form-control"
              value={editFormData.thoiGianVao}
              onChange={(e) => setEditFormData({ ...editFormData, thoiGianVao: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thời gian ra (Để trống nếu đang tập)</label>
            <input
              type="datetime-local"
              className="form-control"
              value={editFormData.thoiGianRa}
              onChange={(e) => setEditFormData({ ...editFormData, thoiGianRa: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Xóa Check-in */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác Nhận Xóa Bản Ghi Check-in"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={handleDeleteSubmit}>Xác Nhận Xóa</button>
          </>
        )}
      >
        <p style={{ color: '#475569' }}>
          Bạn có chắc chắn muốn xóa bản ghi check-in của hội viên <b>{selectedCI?.TenHoiVien}</b> không?
        </p>
      </Modal>
    </div>
  );
};

export default CheckIn;
