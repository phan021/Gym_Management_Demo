use QuanLyPhongGym;
go

-- Có 3 tình huống transaction

-- TRANSACTION 1
-- ĐĂNG KÝ GÓI TẬP + THANH TOÁN
begin try
    begin transaction;
    declare @MaHV int = 1;
    declare @MaGoi int = 1;
    declare @NgayBatDau date = '2027-01-10';
    declare @ThoiHanThang int;
    declare @NgayKetThuc date;
    declare @Gia decimal(18,2);
    declare @MaDK int;

    -- 1. KIỂM TRA HỘI VIÊN
    if not exists (
        select 1
        from HoiVien
        where MaHV = @MaHV
    )
    begin
        throw 50001, N'Hội viên không tồn tại.', 1;
    end;

    -- 2. KIỂM TRA GÓI TẬP
    if not exists (
        select 1
        from GoiTap
        where MaGoi = @MaGoi
          and TrangThai = 1
    )
    begin
        throw 50002, N'Gói tập không tồn tại hoặc đã ngừng hoạt động.', 1;
    end;

    -- 3. LẤY THÔNG TIN GÓI
    select
        @ThoiHanThang = ThoiHanThang,
        @Gia = Gia
    from GoiTap
    where MaGoi = @MaGoi;

    -- 4. TÍNH NGÀY KẾT THÚC
    set @NgayKetThuc =
        dateadd(
            day,
            -1,
            dateadd(month, @ThoiHanThang, @NgayBatDau)
        );

    -- 5. THÊM ĐĂNG KÝ GÓI
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

    -- 6. LẤY MÃ ĐĂNG KÝ VỪA TẠO
    set @MaDK = scope_identity();

    -- 7. TẠO THANH TOÁN
    insert into ThanhToan (
        MaDK,
        SoTien,
        NgayThanhToan,
        PhuongThuc,
        TrangThai
    )
    values (
        @MaDK,
        @Gia,
        getdate(),
        N'Chuyển khoản',
        N'Đã thanh toán'
    );

    -- 8. CẢ 2 THAO TÁC THÀNH CÔNG
    commit transaction;
    print N'Đăng ký gói và thanh toán thành công.';
end try
begin catch

    -- NẾU CÓ LỖI -> HỦY TOÀN BỘ TRANSACTION
    if @@trancount > 0
        rollback transaction;
    print N'Giao dịch thất bại.';
    print N'Lỗi: ' + error_message();
end catch;
go


-- TRANSACTION 2
-- DEMO ROLLBACK
begin transaction;
-- Xem giá trước khi thay đổi
select
    MaGoi,
    TenGoi,
    Gia
from GoiTap
where MaGoi = 1;
-- Tăng giá thử nghiệm
update GoiTap
set Gia = Gia + 100000
where MaGoi = 1;
-- Xem giá sau khi UPDATE
select
    MaGoi,
    TenGoi,
    Gia
from GoiTap
where MaGoi = 1;
-- Hủy thay đổi
rollback transaction;
-- Kiểm tra lại
select
    MaGoi,
    TenGoi,
    Gia
from GoiTap
where MaGoi = 1;
go


-- TRANSACTION 3
-- DEMO COMMIT
-- =====================================================
-- Ví dụ cập nhật trạng thái một lịch PT.
--
-- Để tránh thay đổi dữ liệu mẫu khi chạy toàn bộ file,
-- phần COMMIT được để ở dạng comment.
-- Khi demo có thể bỏ dấu -- để chạy.
-- =====================================================


-- begin transaction;


-- update LichPT
-- set TrangThai = N'Hoàn thành'
-- where MaLich = 21;


-- select *
-- from LichPT
-- where MaLich = 21;


-- commit transaction;


-- select *
-- from LichPT
-- where MaLich = 21;


-- go