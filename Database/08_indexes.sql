use QuanLyPhongGym;
go
-- Có 6 INDEX

-- INDEX 1: ĐĂNG KÝ THEO HỘI VIÊN
-- Mục đích:
-- Tăng tốc tìm các gói tập mà một hội viên đã đăng ký
-- Sử dụng trong:
-- JOIN HoiVien -> DangKy
-- sp_CheckInHoiVien
-- fn_TongTienHoiVien
create index IX_DangKy_MaHV
on DangKy(MaHV);
go


-- INDEX 2: ĐĂNG KÝ THEO GÓI TẬP
-- Mục đích:
-- Tăng tốc tìm các hội viên đăng ký một gói
-- Hỗ trợ thống kê số lượt đăng ký theo gói
-- Sử dụng trong:
-- GROUP BY gói tập
-- vw_ThongKe_GoiTap
create index IX_DangKy_MaGoi
on DangKy(MaGoi);
go


-- INDEX 3: THANH TOÁN THEO NGÀY
-- Mục đích:
-- Tăng tốc tìm kiếm và thống kê thanh toán theo thời gian
-- Sử dụng trong:
-- Báo cáo doanh thu
-- Tìm giao dịch theo ngày
create index IX_ThanhToan_NgayThanhToan
on ThanhToan(NgayThanhToan);
go


-- INDEX 4: THANH TOÁN THEO ĐĂNG KÝ
-- Mục đích:
-- Tăng tốc JOIN giữa ThanhToan và DangKy
-- Quan hệ:
-- DangKy.MaDK -> ThanhToan.MaDK
create index IX_ThanhToan_MaDK
on ThanhToan(MaDK);
go


-- INDEX 5: CHECK-IN THEO HỘI VIÊN VÀ THỜI GIAN
-- Mục đích:
-- Tăng tốc tìm lịch sử check-in của một hội viên
-- Ví dụ:
-- xem hội viên đã đến phòng Gym bao nhiêu lần
create index IX_CheckIn_MaHV_ThoiGianVao
on CheckIn(MaHV, ThoiGianVao);
go


-- INDEX 6: LỊCH PT THEO NGÀY
-- Mục đích:
-- Tăng tốc tìm lịch của PT theo ngày
-- Ví dụ:
-- xem PT có những lịch nào trong một ngày
create index IX_LichPT_NgayTap_MaPT
on LichPT(NgayTap, MaPT);
go


-- KIỂM TRA CÁC INDEX ĐÃ TẠO
select
    t.name as TenBang,
    i.name as TenIndex,
    i.type_desc as LoaiIndex
from sys.indexes i
inner join sys.tables t
    on i.object_id = t.object_id
where i.name is not null
order by t.name, i.name;
go