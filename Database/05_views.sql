use QuanLyPhongGym;
go

-- 4 VIEW
-- 1. vw_HoiVien_GoiTap
-- 2. vw_ThanhToan_HoiVien
-- 3. vw_LichPT_ChiTiet 
-- 4. vw_ThongKe_GoiTap

-- VIEW 1: THÔNG TIN HỘI VIÊN VÀ GÓI TẬP
-- Mục đích:
-- Hiển thị hội viên cùng gói tập đã đăng ký
create view vw_HoiVien_GoiTap
as
select
    hv.MaHV,
    hv.HoTen,
    hv.SoDienThoai,
    hv.Email,
    gt.MaGoi,
    gt.TenGoi,
    gt.ThoiHanThang,
    gt.Gia,
    dk.MaDK,
    dk.NgayDangKy,
    dk.NgayBatDau,
    dk.NgayKetThuc,
    dk.TrangThai
from HoiVien hv
inner join DangKy dk
    on hv.MaHV = dk.MaHV
inner join GoiTap gt
    on dk.MaGoi = gt.MaGoi;
go


-- VIEW 2: THÔNG TIN THANH TOÁN CỦA HỘI VIÊN
-- Mục đích:
-- Dùng để xem lịch sử thanh toán và doanh thu
create view vw_ThanhToan_HoiVien
as
select
    tt.MaTT,
    hv.MaHV,
    hv.HoTen,
    gt.TenGoi,
    tt.SoTien,
    tt.NgayThanhToan,
    tt.PhuongThuc,
    tt.TrangThai
from ThanhToan tt
inner join DangKy dk
    on tt.MaDK = dk.MaDK
inner join HoiVien hv
    on dk.MaHV = hv.MaHV
inner join GoiTap gt
    on dk.MaGoi = gt.MaGoi;
go


-- VIEW 3: CHI TIẾT LỊCH TẬP VỚI PT
-- Mục đích:
-- Hiển thị hội viên tập với PT nào, ngày giờ nào
create view vw_LichPT_ChiTiet
as
select
    l.MaLich,
    hv.MaHV,
    hv.HoTen as TenHoiVien,
    pt.MaPT,
    pt.HoTen as TenPT,
    pt.ChuyenMon,
    l.NgayTap,
    l.GioBatDau,
    l.GioKetThuc,
    l.TrangThai
from LichPT l
inner join HoiVien hv
    on l.MaHV = hv.MaHV
inner join PT pt
    on l.MaPT = pt.MaPT;
go


-- VIEW 4: THỐNG KÊ SỐ LƯỢT ĐĂNG KÝ THEO GÓI TẬP
-- Mục đích:
-- Xem gói tập nào được đăng ký nhiều nhất
create view vw_ThongKe_GoiTap
as
select
    gt.MaGoi,
    gt.TenGoi,
    gt.ThoiHanThang,
    gt.Gia,
    count(dk.MaDK) as SoLuotDangKy
from GoiTap gt
left join DangKy dk
    on gt.MaGoi = dk.MaGoi
group by
    gt.MaGoi,
    gt.TenGoi,
    gt.ThoiHanThang,
    gt.Gia;
go


-- KIỂM TRA CÁC VIEW
select * from vw_HoiVien_GoiTap;
go

select * from vw_ThanhToan_HoiVien;
go

select * from vw_LichPT_ChiTiet;
go

select * from vw_ThongKe_GoiTap;
go