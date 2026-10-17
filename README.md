# HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)

Hệ thống ứng dụng web quản lý phòng gym hoàn chỉnh theo đúng cấu trúc thư mục, cơ sở dữ liệu SQL Server và sơ đồ phân quyền chức năng **ADMIN** và **HỘI VIÊN**.

---

## 📌 1. Sơ Đồ Chức Năng Ứng Dụng (Theo thiết kế)

```
                     QUẢN LÝ PHÒNG GYM
                             │
                         ĐĂNG NHẬP
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
           ADMIN                          HỘI VIÊN
             │                               │
    ┌────────┼────────┐           ┌──────────┼──────────┬──────────┬──────────┬──────────┐
    ▼        ▼        ▼           ▼          ▼          ▼          ▼          ▼          ▼
Hội viên  Gói tập    PT      Xem thông   Xem gói   Xem gói đã   Xem lịch   Xem lịch   Xem / đặt
    │                         tin cá      tập       đăng ký     sử thanh   sử check   lịch PT
    ├── Đăng ký gói           nhân                              toán       -in
    ├── Thanh toán
    ├── Check-in
    ├── Lịch PT
    └── Thống kê (Báo cáo)
```

---

## 🚀 2. Các Chức Năng Chính & Phép Toán CRUD Trên Các Bảng

### 🛡️ Phân hệ Quản trị viên (ADMIN / NHÂN VIÊN)
1. **Quản lý Hội viên (`HoiVien`, `TaiKhoan`)**:
   - Thêm mới hội viên (hỗ trợ tự động cấp tài khoản đăng nhập).
   - Xem danh sách, tìm kiếm theo Tên, SĐT, Email, tính tuổi tự động bằng hàm `fn_TinhTuoi`.
   - Xem chi tiết hồ sơ hội viên: các gói đã đăng ký, lịch sử check-in, lịch tập với PT, tổng chi tiêu `fn_TongTienHoiVien`.
   - Chỉnh sửa thông tin hội viên.
   - Xóa hội viên và dữ liệu liên quan một cách an toàn.

2. **Quản lý Gói tập (`GoiTap`)**:
   - Thêm gói tập mới với thời hạn, giá và mô tả quyền lợi.
   - Chỉnh sửa thông tin gói.
   - Xóa / Chuyển trạng thái ngừng áp dụng (bảo toàn lịch sử giao dịch).
   - Thống kê số lượt đăng ký theo view `vw_ThongKe_GoiTap`.

3. **Quản lý Huấn luyện viên (`PT`)**:
   - Thêm PT mới kèm chuyên môn, số năm kinh nghiệm, mức lương thỏa thuận.
   - Chỉnh sửa thông tin PT.
   - Xóa / Đổi trạng thái nghỉ việc.
   - Thống kê số buổi dạy và số buổi đã hoàn thành.

4. **Nghiệp vụ Đăng ký gói (`DangKy`)**:
   - Đăng ký gói tập cho hội viên sử dụng **Stored Procedure `sp_DangKyGoiTap`** hoặc **Transaction an toàn**.
   - Hỗ trợ tạo đồng thời hóa đơn và thu tiền thanh toán tức thời.
   - Xem số ngày còn lại của gói (`fn_SoNgayConLai`).
   - Gia hạn, sửa thời hạn hoặc hủy đăng ký.

5. **Nghiệp vụ Thanh toán (`ThanhToan`)**:
   - Tạo hóa đơn thu tiền cho các gói đã đăng ký.
   - Lọc theo phương thức (Chuyển khoản, Tiền mặt, Thẻ) và trạng thái.
   - Chỉnh sửa hoặc xóa bản ghi thanh toán.

6. **Điểm danh Check-in (`CheckIn`)**:
   - Quầy quẹt thẻ check-in nhanh sử dụng **Stored Procedure `sp_CheckInHoiVien`** (kiểm tra gói tập còn hạn, ngăn chặn quẹt đúp).
   - Điểm danh vào phòng tập, nút **Check-out** ghi nhận giờ ra tức thì.
   - Thống kê danh sách hội viên đang có mặt trong phòng tập.
   - Sửa giờ vào/ra hoặc xóa bản ghi check-in.

7. **Quản lý Lịch PT (`LichPT`)**:
   - Đặt lịch hẹn tập với Huấn luyện viên sử dụng **Stored Procedure `sp_DatLichPT`** (tự động kiểm tra xung đột trùng giờ của cả PT và Hội viên).
   - Chuyển trạng thái: `Đã đặt`, `Hoàn thành`, `Đã hủy`.
   - Chỉnh sửa hoặc hủy/xóa lịch hẹn.

8. **Thống kê & Báo cáo (`BaoCao`)**:
   - Thống kê chỉ số KPI thời gian thực: Tổng hội viên, gói đang hoạt động, người đang tập trong gym, tổng doanh thu.
   - Báo cáo doanh thu theo tháng/năm sử dụng **Stored Procedure `sp_BaoCaoDoanhThuTheoThang`**.
   - Biểu đồ trực quan doanh thu 12 tháng trong năm.
   - Xếp hạng độ phổ biến của các gói tập dựa trên View `vw_ThongKe_GoiTap`.

---

### 🏋️ Phân hệ Hội viên (HỘI VIÊN)
1. **Xem thông tin cá nhân**: Xem thông tin tài khoản, tuổi, tổng chi tiêu, ngày gia nhập và có thể tự cập nhật SĐT, Email, Địa chỉ.
2. **Xem gói tập**: Tham khảo bảng giá các gói tập đang mở và bấm **Đăng ký gói ngay**.
3. **Xem gói đã đăng ký**: Kiểm tra ngày bắt đầu, ngày hết hạn và số ngày còn lại của các gói tập của bản thân.
4. **Xem lịch sử thanh toán**: Tra cứu tất cả các hóa đơn thanh toán đã thực hiện.
5. **Xem lịch sử check-in**: Xem nhật ký các lần đến phòng tập và thời lượng mỗi buổi tập.
6. **Xem / đặt lịch PT**: Xem lịch tập cá nhân cùng PT, tự đăng ký buổi tập mới (chọn PT, ngày, giờ) hoặc hủy lịch hẹn trước.

---

## 🔑 3. Tài Khoản Mẫu Đăng Nhập

Tất cả tài khoản mặc định có mật khẩu là: **`Gymthattuyet2006@`**  
Hệ thống cho phép đăng nhập bằng **Tên đăng nhập** hoặc **Email**.

| Vai trò | Tên đăng nhập | Email | Mật khẩu mặc định | Quyền hạn |
|---|---|---|---|---|
| **Quản trị viên** | `admin` | `admin@gym.com` | `Gymthattuyet2006@` | Toàn quyền quản trị hệ thống, báo cáo |
| **Nhân viên** | `nhanvien01` | `nhanvien@gym.com` | `Gymthattuyet2006@` | Quản lý hội viên, check-in, thanh toán |
| **Hội viên 1** (Nguyễn Văn Anh) | `na01` | `vananh@gmail.com` | `Gymthattuyet2006@` | Cổng hội viên cá nhân (6 chức năng) |
| **Hội viên 2** (Trần Thị Bình) | `tb01` | `binh@gmail.com` | `Gymthattuyet2006@` | Cổng hội viên cá nhân (6 chức năng) |
| **Hội viên 3** (Lê Văn Cường) | `lc01` | `cuong@gmail.com` | `Gymthattuyet2006@` | Cổng hội viên cá nhân (6 chức năng) |

---

## 🛠️ 4. Hướng Dẫn Cài Đặt & Chạy Dự Án

### 🌟 Cách 1: Chạy Siêu Tốc Bằng Docker (Khuyến Nghị - 1 Lệnh Duy Nhất)
> Không cần cài đặt Node.js hay SQL Server vào máy tính! Chỉ cần máy có cài sẵn **Docker Desktop**.

1. Mở Terminal / CMD tại thư mục gốc của dự án.
2. Khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất:
   ```bash
   docker compose up -d
   ```
3. Mở trình duyệt truy cập ngay: **`http://localhost:5173`**
   *(Hệ thống sẽ tự động khởi động SQL Server 2022, tự nạp cơ sở dữ liệu và dữ liệu mẫu, tự chạy Backend API và giao diện Frontend).*

* Để dừng hệ thống:
  ```bash
  docker compose down
  ```

---

### 💻 Cách 2: Chạy Thủ Công Từng Bước (Nếu không dùng Docker)

#### Yêu cầu môi trường:
- Node.js (v18 trở lên)
- SQL Server (chạy file `Database/full_database.sql` để tạo database `QuanLyPhongGym`)

#### 1. Khởi động Backend (Port 5000):
```bash
cd Backend
npm install
npm start
```
Server chạy tại: `http://localhost:5000`

#### 2. Khởi động Frontend (Port 5173):
```bash
cd Frontend
npm install
npm run dev
```
Truy cập giao diện tại: `http://localhost:5173`

