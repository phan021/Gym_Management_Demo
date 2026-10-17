use QuanLyPhongGym;
go


-- 4 procedure
-- sp_DangKyGoiTap
-- sp_CheckInHoiVien
-- sp_DatLichPT
-- sp_BaoCaoDoanhThuTheoThang


-- PROCEDURE 1: ĐĂNG KÝ GÓI TẬP CHO HỘI VIÊN
-- Chức năng:
-- Kiểm tra hội viên có tồn tại
-- Kiểm tra gói tập có tồn tại và đang hoạt động
-- Tự tính ngày kết thúc theo thời hạn gói
-- Thêm đăng ký mới
create procedure sp_DangKyGoiTap
    @MaHV int,
    @MaGoi int,
    @NgayBatDau date
as
begin
    set nocount on;
    declare @ThoiHanThang int;
    declare @NgayKetThuc date;
    -- Kiểm tra hội viên
    if not exists (
        select 1
        from HoiVien
        where MaHV = @MaHV
    )
    begin
        raiserror(N'Hội viên không tồn tại.', 16, 1);
        return;
    end;
    -- Kiểm tra gói tập
    if not exists (
        select 1
        from GoiTap
        where MaGoi = @MaGoi
          and TrangThai = 1
    )
    begin
        raiserror(N'Gói tập không tồn tại hoặc đã ngừng hoạt động.', 16, 1);
        return;
    end;
    -- Lấy thời hạn của gói
    select @ThoiHanThang = ThoiHanThang
    from GoiTap
    where MaGoi = @MaGoi;
    -- Tính ngày kết thúc
    set @NgayKetThuc =
        dateadd(day, -1, dateadd(month, @ThoiHanThang, @NgayBatDau));
    -- Thêm đăng ký
    insert into DangKy (
        MaHV,
        MaGoi,
        NgayDangKy,
        NgayBatDau,
        NgayKetThuc,
        TrangThai
    )
    values (
        @MaHV,
        @MaGoi,
        getdate(),
        @NgayBatDau,
        @NgayKetThuc,
        N'Đang hoạt động'
    );

    select
        scope_identity() as MaDKMoi,
        N'Đăng ký gói tập thành công.' as ThongBao;
end;
go


-- PROCEDURE 2: CHECK-IN HỘI VIÊN
-- Chức năng:
-- Kiểm tra hội viên tồn tại
-- Kiểm tra hội viên có gói còn hiệu lực
-- Kiểm tra hội viên chưa check-out
-- Sau đó mới cho check-in
create procedure sp_CheckInHoiVien
    @MaHV int
as
begin
    set nocount on;
    -- Kiểm tra hội viên
    if not exists (
        select 1
        from HoiVien
        where MaHV = @MaHV
    )
    begin
        raiserror(N'Hội viên không tồn tại.', 16, 1);
        return;
    end;
    -- Kiểm tra gói tập còn hiệu lực
    if not exists (
        select 1
        from DangKy
        where MaHV = @MaHV
          and TrangThai = N'Đang hoạt động'
          and cast(getdate() as date)
              between NgayBatDau and NgayKetThuc
    )
    begin
        raiserror(
            N'Hội viên không có gói tập còn hiệu lực.',
            16,
            1
        );
        return;
    end;
    -- Kiểm tra đã check-in nhưng chưa check-out
    if exists (
        select 1
        from CheckIn
        where MaHV = @MaHV
          and ThoiGianRa is null
    )
    begin
        raiserror(
            N'Hội viên đã check-in và chưa check-out.',
            16,
            1
        );
        return;
    end;
    -- Thực hiện check-in
    insert into CheckIn (
        MaHV,
        ThoiGianVao
    )
    values (
        @MaHV,
        getdate()
    );
    select
        scope_identity() as MaCheckInMoi,
        N'Check-in thành công.' as ThongBao;
end;
go


-- PROCEDURE 3: ĐẶT LỊCH VỚI PT
-- Chức năng:
-- Kiểm tra hội viên
-- Kiểm tra PT
-- Kiểm tra thời gian
-- Kiểm tra PT có bị trùng lịch hay không
-- Kiểm tra hội viên có bị trùng lịch hay không
create procedure sp_DatLichPT
    @MaHV int,
    @MaPT int,
    @NgayTap date,
    @GioBatDau time,
    @GioKetThuc time
as
begin
    set nocount on;
    -- Kiểm tra hội viên
    if not exists (
        select 1
        from HoiVien
        where MaHV = @MaHV
    )
    begin
        raiserror(N'Hội viên không tồn tại.', 16, 1);
        return;
    end;
    -- Kiểm tra PT
    if not exists (
        select 1
        from PT
        where MaPT = @MaPT
          and TrangThai = 1
    )
    begin
        raiserror(
            N'PT không tồn tại hoặc không hoạt động.',
            16,
            1
        );
        return;
    end;
    -- Kiểm tra giờ
    if @GioKetThuc <= @GioBatDau
    begin
        raiserror(
            N'Giờ kết thúc phải lớn hơn giờ bắt đầu.',
            16,
            1
        );
        return;
    end;
    -- Kiểm tra PT bị trùng khoảng thời gian
    if exists (
        select 1
        from LichPT
        where MaPT = @MaPT
          and NgayTap = @NgayTap
          and TrangThai <> N'Đã hủy'
          and @GioBatDau < GioKetThuc
          and @GioKetThuc > GioBatDau
    )
    begin
        raiserror(
            N'PT đã có lịch trong khoảng thời gian này.',
            16,
            1
        );
        return;
    end;

    -- Kiểm tra hội viên bị trùng lịch
    if exists (
        select 1
        from LichPT
        where MaHV = @MaHV
          and NgayTap = @NgayTap
          and TrangThai <> N'Đã hủy'
          and @GioBatDau < GioKetThuc
          and @GioKetThuc > GioBatDau
    )
    begin
        raiserror(
            N'Hội viên đã có lịch trong khoảng thời gian này.',
            16,
            1
        );
        return;
    end;
    -- Thêm lịch
    insert into LichPT (
        MaHV,
        MaPT,
        NgayTap,
        GioBatDau,
        GioKetThuc,
        TrangThai
    )
    values (
        @MaHV,
        @MaPT,
        @NgayTap,
        @GioBatDau,
        @GioKetThuc,
        N'Đã đặt'
    );
    select
        scope_identity() as MaLichMoi,
        N'Đặt lịch PT thành công.' as ThongBao;
end;
go


-- PROCEDURE 4: BÁO CÁO DOANH THU THEO THÁNG
-- Chức năng:
-- Nhận tháng và năm
-- Tính số giao dịch và tổng doanh thu
-- Chỉ tính giao dịch đã thanh toán
create procedure sp_BaoCaoDoanhThuTheoThang
    @Thang int,
    @Nam int
as
begin
    set nocount on;
    -- Kiểm tra tháng
    if @Thang < 1 or @Thang > 12
    begin
        raiserror(N'Tháng phải nằm trong khoảng từ 1 đến 12.', 16, 1);
        return;
    end;
    select
        @Thang as Thang,
        @Nam as Nam,
        count(*) as SoGiaoDich,
        isnull(sum(SoTien), 0) as TongDoanhThu
    from ThanhToan
    where TrangThai = N'Đã thanh toán'
      and month(NgayThanhToan) = @Thang
      and year(NgayThanhToan) = @Nam;
end;
go


-- KIỂM TRA PROCEDURE
-- 1. Thử đăng ký gói tập
-- exec sp_DangKyGoiTap
--     @MaHV = 1,
--     @MaGoi = 2,
--     @NgayBatDau = '2027-01-10';

-- 2. Thử check-in
-- Lưu ý: chạy câu này sẽ thêm dữ liệu thật vào CheckIn
-- exec sp_CheckInHoiVien
--     @MaHV = 1;

-- 3. Thử đặt lịch PT
-- exec sp_DatLichPT
--     @MaHV = 1,
--     @MaPT = 1,
--     @NgayTap = '2026-11-01',
--     @GioBatDau = '08:00',
--     @GioKetThuc = '09:00';

-- 4. Báo cáo doanh thu tháng 3/2026
exec sp_BaoCaoDoanhThuTheoThang
    @Thang = 3,
    @Nam = 2026;
go