use QuanLyPhongGym;
go

-- 3 function
-- 1.fn_TinhTuoi
-- 2.fn_SoNgayConLai
-- 3.fn_TongTienHoiVien

-- FUNCTION 1: TÍNH TUỔI HỘI VIÊN
-- Chức năng:
-- Nhận vào ngày sinh
-- Trả về tuổi hiện tại của hội viên
create function fn_TinhTuoi
(
    @NgaySinh date
)
returns int
as
begin
    declare @Tuoi int;
    if @NgaySinh is null
        return null;
    set @Tuoi = datediff(year, @NgaySinh, getdate());
    if dateadd(year, @Tuoi, @NgaySinh) > cast(getdate() as date)
        set @Tuoi = @Tuoi - 1;
    return @Tuoi;
end;
go

-- KIỂM TRA FUNCTION 1
select
    MaHV,
    HoTen,
    NgaySinh,
    dbo.fn_TinhTuoi(NgaySinh) as Tuoi
from HoiVien;
go


-- FUNCTION 2: TÍNH SỐ NGÀY CÒN LẠI CỦA GÓI TẬP
-- Chức năng:
-- Nhận vào ngày kết thúc
-- Trả về số ngày còn lại của gói tập
-- Nếu gói đã hết hạn thì trả về 0
create function fn_SoNgayConLai
(
    @NgayKetThuc date
)
returns int
as
begin
    declare @SoNgay int;
    if @NgayKetThuc is null
        return null;
    set @SoNgay = datediff(
        day,
        cast(getdate() as date),
        @NgayKetThuc
    );
    if @SoNgay < 0
        set @SoNgay = 0;
    return @SoNgay;
end;
go

-- KIỂM TRA FUNCTION 2
select
    hv.MaHV,
    hv.HoTen,
    gt.TenGoi,
    dk.NgayBatDau,
    dk.NgayKetThuc,
    dbo.fn_SoNgayConLai(dk.NgayKetThuc) as SoNgayConLai
from HoiVien hv
inner join DangKy dk
    on hv.MaHV = dk.MaHV
inner join GoiTap gt
    on dk.MaGoi = gt.MaGoi;
go


-- FUNCTION 3: TÍNH TỔNG TIỀN HỘI VIÊN ĐÃ THANH TOÁN
-- Chức năng:
-- Nhận vào mã hội viên
-- Trả về tổng số tiền hội viên đã thanh toán
create function fn_TongTienHoiVien
(
    @MaHV int
)
returns decimal(18,2)
as
begin
    declare @TongTien decimal(18,2);
    select @TongTien = sum(tt.SoTien)
    from ThanhToan tt
    inner join DangKy dk
        on tt.MaDK = dk.MaDK
    where dk.MaHV = @MaHV
      and tt.TrangThai = N'Đã thanh toán';
    if @TongTien is null
        set @TongTien = 0;
    return @TongTien;
end;
go

-- KIỂM TRA FUNCTION 3
select
    MaHV,
    HoTen,
    dbo.fn_TongTienHoiVien(MaHV) as TongTienDaThanhToan
from HoiVien;
go