create database QuanLyPhongGym;
go

use QuanLyPhongGym;
go
use QuanLyPhongGym;
go

-- Tạo Bảng
-- 1. BẢNG TÀI KHOẢN
create table TaiKhoan (
    MaTK int identity(1,1) primary key,
    TenDangNhap varchar(50) not null unique,
    MatKhau varchar(255) not null,
    VaiTro varchar(20) not null default 'HOIVIEN',
    TrangThai bit not null default 1,
    constraint CK_TaiKhoan_VaiTro
        check (VaiTro in ('ADMIN', 'NHANVIEN', 'HOIVIEN'))
);
go

-- 2. BẢNG HỘI VIÊN
create table HoiVien (
    MaHV int identity(1,1) primary key,
    HoTen nvarchar(100) not null,
    NgaySinh date,
    GioiTinh nvarchar(10),
    SoDienThoai varchar(15) not null unique,
    Email varchar(100) unique,
    DiaChi nvarchar(255),
    NgayThamGia date not null default getdate(),
    MaTK int unique,
    constraint CK_HoiVien_GioiTinh
        check (GioiTinh in (N'Nam', N'Nữ', N'Khác')),
    constraint FK_HoiVien_TaiKhoan
        foreign key (MaTK) references TaiKhoan(MaTK)
);
go

-- 3. BẢNG GÓI TẬP
create table GoiTap (
    MaGoi int identity(1,1) primary key,
    TenGoi nvarchar(100) not null unique,
    ThoiHanThang int not null,
    Gia decimal(18,2) not null,
    MoTa nvarchar(500),
    TrangThai bit not null default 1,
    constraint CK_GoiTap_ThoiHan
        check (ThoiHanThang > 0),
    constraint CK_GoiTap_Gia
        check (Gia >= 0)
);
go

-- 4. BẢNG PT=
create table PT (
    MaPT int identity(1,1) primary key,
    HoTen nvarchar(100) not null,
    SoDienThoai varchar(15) not null unique,
    Email varchar(100) unique,
    ChuyenMon nvarchar(100) not null,
    KinhNghiem int not null default 0,
    Luong decimal(18,2),
    TrangThai bit not null default 1,
    constraint CK_PT_KinhNghiem
        check (KinhNghiem >= 0),
    constraint CK_PT_Luong
        check (Luong is null or Luong >= 0)
);
go

-- 5. BẢNG ĐĂNG KÝ GÓI TẬP
create table DangKy (
    MaDK int identity(1,1) primary key,
    MaHV int not null,
    MaGoi int not null,
    NgayDangKy date not null default getdate(),
    NgayBatDau date not null,
    NgayKetThuc date not null,
    TrangThai nvarchar(20) not null default N'Đang hoạt động',
    constraint FK_DangKy_HoiVien
        foreign key (MaHV) references HoiVien(MaHV),
    constraint FK_DangKy_GoiTap
        foreign key (MaGoi) references GoiTap(MaGoi),
    constraint CK_DangKy_Ngay
        check (NgayKetThuc >= NgayBatDau),
    constraint CK_DangKy_TrangThai
        check (TrangThai in (
            N'Đang hoạt động',
            N'Hết hạn',
            N'Đã hủy'
        ))
);
go

-- 6. BẢNG THANH TOÁN
create table ThanhToan (
    MaTT int identity(1,1) primary key,
    MaDK int not null,
    SoTien decimal(18,2) not null,
    NgayThanhToan datetime not null default getdate(),
    PhuongThuc nvarchar(30) not null,
    TrangThai nvarchar(30) not null default N'Đã thanh toán',
    constraint FK_ThanhToan_DangKy
        foreign key (MaDK) references DangKy(MaDK),
    constraint CK_ThanhToan_SoTien
        check (SoTien > 0),
    constraint CK_ThanhToan_PhuongThuc
        check (PhuongThuc in (
            N'Tiền mặt',
            N'Chuyển khoản',
            N'Thẻ'
        )),
    constraint CK_ThanhToan_TrangThai
        check (TrangThai in (
            N'Chờ thanh toán',
            N'Đã thanh toán',
            N'Đã hủy'
        ))
);
go

-- 7. BẢNG CHECK-IN
create table CheckIn (
    MaCheckIn int identity(1,1) primary key,
    MaHV int not null,
    ThoiGianVao datetime not null default getdate(),
    ThoiGianRa datetime,
    constraint FK_CheckIn_HoiVien
        foreign key (MaHV) references HoiVien(MaHV),
    constraint CK_CheckIn_ThoiGian
        check (
            ThoiGianRa is null
            or ThoiGianRa >= ThoiGianVao
        )
);
go

-- 8. BẢNG LỊCH PT
create table LichPT (
    MaLich int identity(1,1) primary key,
    MaHV int not null,
    MaPT int not null,
    NgayTap date not null,
    GioBatDau time not null,
    GioKetThuc time not null,
    TrangThai nvarchar(30) not null default N'Đã đặt',
    constraint FK_LichPT_HoiVien
        foreign key (MaHV) references HoiVien(MaHV),
    constraint FK_LichPT_PT
        foreign key (MaPT) references PT(MaPT),
    constraint CK_LichPT_Gio
        check (GioKetThuc > GioBatDau),
    constraint CK_LichPT_TrangThai
        check (TrangThai in (
            N'Đã đặt',
            N'Hoàn thành',
            N'Đã hủy'
        )),
    constraint UQ_LichPT_PT
        unique (MaPT, NgayTap, GioBatDau)
);
go
use QuanLyPhongGym;
go

-- Táº¡o dá»¯ liá»‡u máº«u
-- 1. Dá»® LIá»†U TÃ€I KHOáº¢N
insert into TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThai)
values
('admin', 'Gymthattuyet2006@', 'ADMIN', 1),
('nhanvien01', 'Gymthattuyet2006@', 'NHANVIEN', 1),
('na01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('tb01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('lc01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('pd01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('hd01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('vh01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('dg01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('bh01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('dh01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('nl01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('dl01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('lm01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('tn01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('mo01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('cp01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('dq01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('nq01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('ts01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('lt01', 'Gymthattuyet2006@', 'HOIVIEN', 1),
('pu01', 'Gymthattuyet2006@', 'HOIVIEN', 1);
go

-- 2. Dá»® LIá»†U Há»˜I VIÃŠN
-- MaTK 3 -> 22 thuá»™c cÃ¡c tÃ i khoáº£n há»™i viÃªn
insert into HoiVien
(HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, NgayThamGia, MaTK)
values
(N'Nguyá»…n VÄƒn An', '2003-05-12', N'Nam',
 '0901000001', 'an@gmail.com', N'HÃ  Ná»™i', '2026-01-10', 3),
(N'Tráº§n Thá»‹ BÃ¬nh', '2004-08-20', N'Ná»¯',
 '0901000002', 'binh@gmail.com', N'HÃ  Ná»™i', '2026-01-15', 4),
(N'LÃª VÄƒn CÆ°á»ng', '2002-03-15', N'Nam',
 '0901000003', 'cuong@gmail.com', N'Báº¯c Ninh', '2026-02-01', 5),
(N'Pháº¡m Thá»‹ Dung', '2003-11-10', N'Ná»¯',
 '0901000004', 'dung@gmail.com', N'HÃ  Ná»™i', '2026-02-10', 6),
(N'HoÃ ng VÄƒn Äá»©c', '2001-07-07', N'Nam',
 '0901000005', 'duc@gmail.com', N'Háº£i PhÃ²ng', '2026-02-20', 7),
(N'VÅ© Thá»‹ HÃ ', '2004-01-25', N'Ná»¯',
 '0901000006', 'ha@gmail.com', N'HÃ  Ná»™i', '2026-03-01', 8),
(N'Äáº·ng VÄƒn Giang', '2000-09-09', N'Nam',
 '0901000007', 'giang@gmail.com', N'HÆ°ng YÃªn', '2026-03-05', 9),
(N'BÃ¹i Thá»‹ HÆ°Æ¡ng', '2003-06-18', N'Ná»¯',
 '0901000008', 'huong@gmail.com', N'HÃ  Ná»™i', '2026-03-12', 10),
(N'Äá»— VÄƒn HÃ¹ng', '2002-12-01', N'Nam',
 '0901000009', 'hung@gmail.com', N'Nam Äá»‹nh', '2026-04-01', 11),
(N'NgÃ´ Thá»‹ Lan', '2004-02-14', N'Ná»¯',
 '0901000010', 'lan@gmail.com', N'HÃ  Ná»™i', '2026-04-05', 12),
(N'DÆ°Æ¡ng VÄƒn Long', '2001-04-30', N'Nam',
 '0901000011', 'long@gmail.com', N'HÃ  Ná»™i', '2026-04-15', 13),
(N'LÃ½ Thá»‹ Mai', '2003-10-21', N'Ná»¯',
 '0901000012', 'mai@gmail.com', N'Báº¯c Giang', '2026-05-01', 14),
(N'Trá»‹nh VÄƒn Nam', '2002-08-08', N'Nam',
 '0901000013', 'nam@gmail.com', N'HÃ  Ná»™i', '2026-05-10', 15),
(N'Mai Thá»‹ Oanh', '2004-04-17', N'Ná»¯',
 '0901000014', 'oanh@gmail.com', N'HÃ  Nam', '2026-05-20', 16),
(N'Cao VÄƒn PhÃºc', '2000-01-11', N'Nam',
 '0901000015', 'phuc@gmail.com', N'HÃ  Ná»™i', '2026-06-01', 17),
(N'ÄoÃ n Thá»‹ Quá»³nh', '2003-07-19', N'Ná»¯',
 '0901000016', 'quynh@gmail.com', N'HÃ  Ná»™i', '2026-06-15', 18),
(N'Nguyá»…n VÄƒn QuÃ¢n', '2001-05-23', N'Nam',
 '0901000017', 'quan@gmail.com', N'ThÃ¡i BÃ¬nh', '2026-07-01', 19),
(N'Tráº§n Minh SÆ¡n', '2002-09-13', N'Nam',
 '0901000018', 'son@gmail.com', N'HÃ  Ná»™i', '2026-07-10', 20),
(N'LÃª Anh Tuáº¥n', '2003-03-28', N'Nam',
 '0901000019', 'tuan@gmail.com', N'HÃ  Ná»™i', '2026-08-01', 21),
(N'Pháº¡m Minh UyÃªn', '2004-12-05', N'Ná»¯',
 '0901000020', 'uyen@gmail.com', N'HÃ  Ná»™i', '2026-08-10', 22);
go

-- 3. Dá»® LIá»†U GÃ“I Táº¬P
insert into GoiTap
(TenGoi, ThoiHanThang, Gia, MoTa, TrangThai)
values
(N'GÃ³i 1 thÃ¡ng', 1, 500000,
 N'Táº­p luyá»‡n khÃ´ng giá»›i háº¡n trong 1 thÃ¡ng', 1),
(N'GÃ³i 3 thÃ¡ng', 3, 1350000,
 N'Táº­p luyá»‡n khÃ´ng giá»›i háº¡n trong 3 thÃ¡ng', 1),
(N'GÃ³i 6 thÃ¡ng', 6, 2500000,
 N'Táº­p luyá»‡n khÃ´ng giá»›i háº¡n trong 6 thÃ¡ng', 1),
(N'GÃ³i 12 thÃ¡ng', 12, 4500000,
 N'Táº­p luyá»‡n khÃ´ng giá»›i háº¡n trong 12 thÃ¡ng', 1),
(N'GÃ³i Sinh viÃªn', 1, 350000,
 N'GÃ³i Æ°u Ä‘Ã£i dÃ nh cho sinh viÃªn', 1),
(N'GÃ³i VIP 3 thÃ¡ng', 3, 3000000,
 N'GÃ³i VIP bao gá»“m khu táº­p cao cáº¥p', 1),
(N'GÃ³i VIP 6 thÃ¡ng', 6, 5500000,
 N'GÃ³i VIP trong 6 thÃ¡ng', 1),
(N'GÃ³i VIP 12 thÃ¡ng', 12, 10000000,
 N'GÃ³i VIP trong 12 thÃ¡ng', 1);
go

-- 4. Dá»® LIá»†U PT
insert into PT
(HoTen, SoDienThoai, Email, ChuyenMon, KinhNghiem, Luong, TrangThai)
values
(N'Nguyá»…n Minh KhÃ´i', '0911000001',
 'khoi@gym.com', N'TÄƒng cÆ¡', 5, 15000000, 1),
(N'Tráº§n HoÃ ng Nam', '0911000002',
 'nampt@gym.com', N'Giáº£m cÃ¢n', 4, 14000000, 1),
(N'LÃª Thu Trang', '0911000003',
 'trang@gym.com', N'Yoga', 6, 16000000, 1),
(N'Pháº¡m Quá»‘c Báº£o', '0911000004',
 'bao@gym.com', N'Cardio', 3, 12000000, 1),
(N'HoÃ ng Ngá»c Anh', '0911000005',
 'ngocanh@gym.com', N'Fitness', 7, 18000000, 1),
(N'VÅ© Minh Äá»©c', '0911000006',
 'ducpt@gym.com', N'Bodybuilding', 8, 20000000, 1);
go

-- 5. Dá»® LIá»†U ÄÄ‚NG KÃ GÃ“I
insert into DangKy
(MaHV, MaGoi, NgayDangKy, NgayBatDau, NgayKetThuc, TrangThai)
values
(1, 4, '2026-01-10', '2026-01-10', '2027-01-09', N'Äang hoáº¡t Ä‘á»™ng'),
(2, 3, '2026-01-15', '2026-01-15', '2026-07-14', N'Háº¿t háº¡n'),
(3, 2, '2026-02-01', '2026-02-01', '2026-04-30', N'Háº¿t háº¡n'),
(4, 4, '2026-02-10', '2026-02-10', '2027-02-09', N'Äang hoáº¡t Ä‘á»™ng'),
(5, 1, '2026-02-20', '2026-02-20', '2026-03-19', N'Háº¿t háº¡n'),
(6, 7, '2026-03-01', '2026-03-01', '2026-08-31', N'Háº¿t háº¡n'),
(7, 4, '2026-03-05', '2026-03-05', '2027-03-04', N'Äang hoáº¡t Ä‘á»™ng'),
(8, 3, '2026-03-12', '2026-03-12', '2026-09-11', N'Háº¿t háº¡n'),
(9, 6, '2026-04-01', '2026-04-01', '2026-06-30', N'Háº¿t háº¡n'),
(10, 4, '2026-04-05', '2026-04-05', '2027-04-04', N'Äang hoáº¡t Ä‘á»™ng'),
(11, 3, '2026-04-15', '2026-04-15', '2026-10-14', N'Háº¿t háº¡n'),
(12, 4, '2026-05-01', '2026-05-01', '2027-04-30', N'Äang hoáº¡t Ä‘á»™ng'),
(13, 2, '2026-05-10', '2026-05-10', '2026-08-09', N'Háº¿t háº¡n'),
(14, 4, '2026-05-20', '2026-05-20', '2027-05-19', N'Äang hoáº¡t Ä‘á»™ng'),
(15, 3, '2026-06-01', '2026-06-01', '2026-11-30', N'Äang hoáº¡t Ä‘á»™ng'),
(16, 6, '2026-06-15', '2026-06-15', '2026-09-14', N'Háº¿t háº¡n'),
(17, 4, '2026-07-01', '2026-07-01', '2027-06-30', N'Äang hoáº¡t Ä‘á»™ng'),
(18, 3, '2026-07-10', '2026-07-10', '2027-01-09', N'Äang hoáº¡t Ä‘á»™ng'),
(19, 2, '2026-08-01', '2026-08-01', '2026-10-31', N'Äang hoáº¡t Ä‘á»™ng'),
(20, 7, '2026-08-10', '2026-08-10', '2027-02-09', N'Äang hoáº¡t Ä‘á»™ng');
go

-- 6. Dá»® LIá»†U THANH TOÃN
insert into ThanhToan
(MaDK, SoTien, NgayThanhToan, PhuongThuc, TrangThai)
values
(1, 4500000, '2026-01-10', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(2, 2500000, '2026-01-15', N'Tháº»', N'ÄÃ£ thanh toÃ¡n'),
(3, 1350000, '2026-02-01', N'Tiá»n máº·t', N'ÄÃ£ thanh toÃ¡n'),
(4, 4500000, '2026-02-10', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(5, 500000, '2026-02-20', N'Tiá»n máº·t', N'ÄÃ£ thanh toÃ¡n'),
(6, 5500000, '2026-03-01', N'Tháº»', N'ÄÃ£ thanh toÃ¡n'),
(7, 4500000, '2026-03-05', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(8, 2500000, '2026-03-12', N'Tiá»n máº·t', N'ÄÃ£ thanh toÃ¡n'),
(9, 3000000, '2026-04-01', N'Tháº»', N'ÄÃ£ thanh toÃ¡n'),
(10, 4500000, '2026-04-05', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(11, 2500000, '2026-04-15', N'Tiá»n máº·t', N'ÄÃ£ thanh toÃ¡n'),
(12, 4500000, '2026-05-01', N'Tháº»', N'ÄÃ£ thanh toÃ¡n'),
(13, 1350000, '2026-05-10', N'Tiá»n máº·t', N'ÄÃ£ thanh toÃ¡n'),
(14, 4500000, '2026-05-20', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(15, 2500000, '2026-06-01', N'Tháº»', N'ÄÃ£ thanh toÃ¡n'),
(16, 3000000, '2026-06-15', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(17, 4500000, '2026-07-01', N'Tiá»n máº·t', N'ÄÃ£ thanh toÃ¡n'),
(18, 2500000, '2026-07-10', N'Tháº»', N'ÄÃ£ thanh toÃ¡n'),
(19, 1350000, '2026-08-01', N'Chuyá»ƒn khoáº£n', N'ÄÃ£ thanh toÃ¡n'),
(20, 5500000, '2026-08-10', N'Tháº»', N'ÄÃ£ thanh toÃ¡n');
go

-- 7. Dá»® LIá»†U CHECK-IN
insert into CheckIn
(MaHV, ThoiGianVao, ThoiGianRa)
values
(1, '2026-10-01 07:00:00', '2026-10-01 08:30:00'),
(4, '2026-10-01 08:00:00', '2026-10-01 09:30:00'),
(7, '2026-10-01 17:00:00', '2026-10-01 18:30:00'),
(10, '2026-10-01 18:00:00', '2026-10-01 19:30:00'),
(1, '2026-10-02 07:15:00', '2026-10-02 08:45:00'),
(12, '2026-10-02 08:30:00', '2026-10-02 10:00:00'),
(14, '2026-10-02 16:00:00', '2026-10-02 17:30:00'),
(15, '2026-10-02 18:30:00', '2026-10-02 20:00:00'),
(17, '2026-10-03 06:30:00', '2026-10-03 08:00:00'),
(18, '2026-10-03 07:30:00', '2026-10-03 09:00:00'),
(19, '2026-10-03 17:30:00', '2026-10-03 19:00:00'),
(20, '2026-10-03 19:00:00', '2026-10-03 20:30:00'),
(1, '2026-10-05 07:00:00', '2026-10-05 08:30:00'),
(4, '2026-10-05 08:00:00', '2026-10-05 09:30:00'),
(7, '2026-10-05 17:00:00', '2026-10-05 18:30:00'),
(10, '2026-10-05 18:00:00', '2026-10-05 19:30:00'),
(12, '2026-10-06 07:00:00', '2026-10-06 08:30:00'),
(14, '2026-10-06 08:00:00', '2026-10-06 09:30:00'),
(15, '2026-10-06 17:00:00', '2026-10-06 18:30:00'),
(17, '2026-10-06 18:00:00', '2026-10-06 19:30:00'),
(18, '2026-10-07 06:30:00', '2026-10-07 08:00:00'),
(19, '2026-10-07 07:30:00', '2026-10-07 09:00:00'),
(20, '2026-10-07 17:30:00', '2026-10-07 19:00:00'),
(1, '2026-10-07 19:00:00', '2026-10-07 20:30:00'),
(4, '2026-10-08 07:00:00', '2026-10-08 08:30:00'),
(7, '2026-10-08 08:00:00', '2026-10-08 09:30:00'),
(10, '2026-10-08 17:00:00', '2026-10-08 18:30:00'),
(12, '2026-10-08 18:00:00', '2026-10-08 19:30:00'),
(14, '2026-10-09 07:00:00', '2026-10-09 08:30:00'),
(15, '2026-10-09 18:00:00', '2026-10-09 19:30:00');
go

-- 8. Dá»® LIá»†U Lá»ŠCH PT
insert into LichPT
(MaHV, MaPT, NgayTap, GioBatDau, GioKetThuc, TrangThai)
values
(1, 1, '2026-10-01', '08:00', '09:00', N'HoÃ n thÃ nh'),
(4, 2, '2026-10-01', '09:00', '10:00', N'HoÃ n thÃ nh'),
(7, 3, '2026-10-01', '10:00', '11:00', N'HoÃ n thÃ nh'),
(10, 4, '2026-10-01', '14:00', '15:00', N'HoÃ n thÃ nh'),
(12, 5, '2026-10-02', '08:00', '09:00', N'HoÃ n thÃ nh'),
(14, 6, '2026-10-02', '09:00', '10:00', N'HoÃ n thÃ nh'),
(15, 1, '2026-10-02', '10:00', '11:00', N'HoÃ n thÃ nh'),
(17, 2, '2026-10-02', '14:00', '15:00', N'HoÃ n thÃ nh'),
(18, 3, '2026-10-03', '08:00', '09:00', N'HoÃ n thÃ nh'),
(19, 4, '2026-10-03', '09:00', '10:00', N'HoÃ n thÃ nh'),
(20, 5, '2026-10-03', '10:00', '11:00', N'HoÃ n thÃ nh'),
(1, 6, '2026-10-05', '08:00', '09:00', N'HoÃ n thÃ nh'),
(4, 1, '2026-10-05', '09:00', '10:00', N'HoÃ n thÃ nh'),
(7, 2, '2026-10-05', '10:00', '11:00', N'HoÃ n thÃ nh'),

(10, 3, '2026-10-06', '08:00', '09:00', N'HoÃ n thÃ nh'),
(12, 4, '2026-10-06', '09:00', '10:00', N'HoÃ n thÃ nh'),
(14, 5, '2026-10-06', '10:00', '11:00', N'HoÃ n thÃ nh'),
(15, 6, '2026-10-07', '08:00', '09:00', N'HoÃ n thÃ nh'),
(17, 1, '2026-10-07', '09:00', '10:00', N'HoÃ n thÃ nh'),
(18, 2, '2026-10-07', '10:00', '11:00', N'HoÃ n thÃ nh'),
(19, 3, '2026-10-18', '08:00', '09:00', N'ÄÃ£ Ä‘áº·t'),
(20, 4, '2026-10-18', '09:00', '10:00', N'ÄÃ£ Ä‘áº·t'),
(1, 5, '2026-10-19', '08:00', '09:00', N'ÄÃ£ Ä‘áº·t'),
(4, 6, '2026-10-19', '09:00', '10:00', N'ÄÃ£ Ä‘áº·t'),
(7, 1, '2026-10-20', '08:00', '09:00', N'ÄÃ£ Ä‘áº·t'),
(10, 2, '2026-10-20', '09:00', '10:00', N'ÄÃ£ Ä‘áº·t'),
(12, 3, '2026-10-21', '08:00', '09:00', N'ÄÃ£ Ä‘áº·t'),
(14, 4, '2026-10-21', '09:00', '10:00', N'ÄÃ£ Ä‘áº·t'),
(15, 5, '2026-10-22', '08:00', '09:00', N'ÄÃ£ Ä‘áº·t'),
(17, 6, '2026-10-22', '09:00', '10:00', N'ÄÃ£ há»§y');
go


-- KIá»‚M TRA Dá»® LIá»†U

select * from TaiKhoan;
select * from HoiVien;
select * from GoiTap;
select * from PT;
select * from DangKy;
select * from ThanhToan;
select * from CheckIn;
select * from LichPT;
go
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
    -- Tự động hủy các gói đang hoạt động trước đó của hội viên này
    update DangKy
    set TrangThai = N'Đã hủy'
    where MaHV = @MaHV and TrangThai = N'Đang hoạt động';

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
        N'Đăng ký gói tập thành công. Gói tập cũ đã được tự động hủy.' as ThongBao;
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
