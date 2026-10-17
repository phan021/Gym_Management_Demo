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