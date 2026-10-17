use QuanLyPhongGym;
go


-- 14 Truy Vấn
-- CÂU 1: SELECT *
-- HIỂN THỊ TOÀN BỘ DANH SÁCH HỘI VIÊN
select *
from HoiVien;
go

-- CÂU 2: LIKE
-- TÌM HỘI VIÊN CÓ HỌ NGUYỄN
select MaHV, HoTen, SoDienThoai, Email, DiaChi
from HoiVien
where HoTen like N'Nguyễn%';
go

-- CÂU 3: BETWEEN
-- TÌM HỘI VIÊN THAM GIA TỪ 01/03/2026 ĐẾN 31/05/2026
select MaHV, HoTen, NgayThamGia
from HoiVien
where NgayThamGia between '2026-03-01' and '2026-05-31'
order by NgayThamGia;
go

-- CÂU 4: TOP
-- LẤY 5 GÓI TẬP CÓ GIÁ CAO NHẤT
select top 5
    MaGoi,
    TenGoi,
    ThoiHanThang,
    Gia
from GoiTap
order by Gia desc;
go

-- CÂU 5: INNER JOIN
-- HIỂN THỊ HỘI VIÊN VÀ GÓI TẬP ĐÃ ĐĂNG KÝ
select
    hv.MaHV,
    hv.HoTen,
    gt.TenGoi,
    dk.NgayBatDau,
    dk.NgayKetThuc,
    dk.TrangThai
from HoiVien hv
inner join DangKy dk
    on hv.MaHV = dk.MaHV
inner join GoiTap gt
    on dk.MaGoi = gt.MaGoi
order by hv.MaHV;
go

-- CÂU 6: LEFT JOIN
-- HIỂN THỊ TẤT CẢ HỘI VIÊN
-- KỂ CẢ HỘI VIÊN CHƯA ĐĂNG KÝ GÓI TẬP
select
    hv.MaHV,
    hv.HoTen,
    gt.TenGoi,
    dk.NgayBatDau,
    dk.NgayKetThuc
from HoiVien hv
left join DangKy dk
    on hv.MaHV = dk.MaHV
left join GoiTap gt
    on dk.MaGoi = gt.MaGoi
order by hv.MaHV;
go

-- CÂU 7: RIGHT JOIN
-- HIỂN THỊ TẤT CẢ GÓI TẬP
-- KỂ CẢ GÓI CHƯA CÓ HỘI VIÊN ĐĂNG KÝ

select
    gt.MaGoi,
    gt.TenGoi,
    hv.HoTen,
    dk.NgayDangKy
from DangKy dk
right join GoiTap gt
    on dk.MaGoi = gt.MaGoi
left join HoiVien hv
    on dk.MaHV = hv.MaHV
order by gt.MaGoi;
go

-- CÂU 8: FULL JOIN
-- HIỂN THỊ TOÀN BỘ HỘI VIÊN VÀ GÓI TẬP
-- KỂ CẢ TRƯỜNG HỢP CHƯA CÓ QUAN HỆ ĐĂNG KÝ
select
    hv.MaHV,
    hv.HoTen,
    gt.MaGoi,
    gt.TenGoi
from HoiVien hv
full join DangKy dk
    on hv.MaHV = dk.MaHV
full join GoiTap gt
    on dk.MaGoi = gt.MaGoi
order by hv.MaHV;
go

-- CÂU 9: GROUP BY + COUNT
-- THỐNG KÊ SỐ HỘI VIÊN ĐĂNG KÝ TỪNG GÓI TẬP
select
    gt.MaGoi,
    gt.TenGoi,
    count(dk.MaDK) as SoLuongDangKy
from GoiTap gt
left join DangKy dk
    on gt.MaGoi = dk.MaGoi
group by gt.MaGoi, gt.TenGoi
order by SoLuongDangKy desc;
go

-- CÂU 10: GROUP BY + HAVING
-- TÌM CÁC GÓI TẬP CÓ TỪ 2 LƯỢT ĐĂNG KÝ TRỞ LÊN
select
    gt.MaGoi,
    gt.TenGoi,
    count(dk.MaDK) as SoLuongDangKy
from GoiTap gt
inner join DangKy dk
    on gt.MaGoi = dk.MaGoi
group by gt.MaGoi, gt.TenGoi
having count(dk.MaDK) >= 2
order by SoLuongDangKy desc;
go

-- CÂU 11: SUBQUERY
-- TÌM GÓI TẬP CÓ GIÁ CAO HƠN GIÁ TRUNG BÌNH
select
    MaGoi,
    TenGoi,
    ThoiHanThang,
    Gia
from GoiTap
where Gia > (
    select avg(Gia)
    from GoiTap
)
order by Gia desc;
go

-- CÂU 12: GROUP BY + SUM
-- THỐNG KÊ DOANH THU THEO THÁNG
-- CHỈ TÍNH CÁC GIAO DỊCH ĐÃ THANH TOÁN
select
    year(NgayThanhToan) as Nam,
    month(NgayThanhToan) as Thang,
    sum(SoTien) as TongDoanhThu
from ThanhToan
where TrangThai = N'Đã thanh toán'
group by
    year(NgayThanhToan),
    month(NgayThanhToan)
order by Nam, Thang;
go

-- CÂU 13: UNION
-- GỘP DANH SÁCH HỘI VIÊN VÀ PT
select
    HoTen,
    SoDienThoai,
    N'Hội viên' as LoaiNguoi
from HoiVien
union
select
    HoTen,
    SoDienThoai,
    N'PT' as LoaiNguoi
from PT;
go

-- CÂU 14: INTERSECT VÀ EXCEPT
-- KIỂM TRA HỘI VIÊN CÓ / CHƯA TỪNG CHECK-IN
-- 14.1 HỘI VIÊN ĐÃ TỪNG CHECK-IN
select MaHV
from HoiVien
intersect
select MaHV
from CheckIn;
go

-- 14.2 HỘI VIÊN CHƯA TỪNG CHECK-IN
select MaHV
from HoiVien
except
select MaHV
from CheckIn;
go