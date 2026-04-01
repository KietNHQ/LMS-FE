# EduVN LMS Frontend

Hệ thống quản lý học tập (Learning Management System - LMS) dành cho EduVN. Dự án này là phần Front-End được xây dựng bằng **React**, **Vite** nhằm cung cấp một giao diện quản trị hiện đại, mượt mà và trực quan cho các cấp quản lý, giáo viên, học sinh và phụ huynh.

---

## Tính năng cốt lõi (Trang Quản Trị - Admin)

Dự án bao gồm một hệ thống quản trị toàn diện, phân hệ rõ ràng để theo dõi và điều hành trường học/trung tâm:

### 1. Bảng điều khiển (Dashboard)
- Giao diện tổng quan trực quan với các biểu đồ thống kê đa chiều (sử dụng `recharts`).
- Theo dõi số lượng học sinh, doanh thu, lịch học hiện tại trong ngày.
- Quản lý đồng bộ: **Năm học & Học kỳ** được áp dụng toàn cục (Global Context), thay đổi năm/học kỳ trên Dashboard sẽ tự động đồng bộ hoá dữ liệu lọc trên tất cả các trang quản lý khác.

### 2. Hệ thống Quản lý Con người
- **Quản lý Người dùng (Users):** Quản trị viên cấp cao có thể giám sát toàn bộ tài khoản trong hệ thống, cấp quyền, khoá/mở khoá.
- **Quản lý Giáo viên (Teachers):** Tạo mới tài khoản, phân công chuyên môn, xếp lịch dạy và quản lý thông tin liên lạc.
- **Quản lý Học sinh (Students):** Thêm mới học sinh, phân lớp, quản lý hồ sơ học tập, tích hợp Import/Export dữ liệu từ file Excel.
- **Quản lý Phụ huynh (Parents):** Kết nối tài khoản phụ huynh với học sinh, đảm bảo liên lạc thông suốt, cung cấp quyền theo dõi tiến độ học tập.

### 3. Quản lý Đào tạo & Vận hành
- **Quản lý Lớp học (Classes):** Xây dựng phòng học, chia khối (Grade), gán giáo viên chủ nhiệm và sĩ số.
- **Quản lý Bài Kiểm Tra (Quizzes):** Tạo, chỉnh sửa bài kiểm tra. Hỗ trợ hệ thống bộ lọc đa phân cấp (theo Khối, theo Môn học) rất trực quan và tiện dụng.
- **Quản lý Thời Khóa Biểu (Timetable):** Giao diện lưới lịch học giúp admin và giáo viên dễ dàng xếp lịch, tự động phát hiện xung đột lịch giảng dạy (Conflict Checker).
- **Quản lý Thanh Toán (Payments):** Theo dõi học phí, in hóa đơn và kiểm soát các giao dịch tài chính liên quan đến học viên.

---

## Công nghệ sử dụng

- **Core:** React 19, Vite (Fast Refresh & HMR)
- **Routing:** React Router v7
- **Giao diện & Thành phần UI:** 
  - CSS thuần cấu trúc theo mô hình BEM/Module, kết hợp CSS Variables để tối ưu hóa khả năng tái sử dụng (không dùng Tailwind).
  - Biểu tượng (Icons): `react-icons`, `lucide-react`, `@mui/icons-material`.
  - Thành phần nâng cao: Modal, Dropdown, Table tuỳ chỉnh, Toast notifications (`react-toastify`).
- **Xử lý Dữ liệu:** 
  - `axios` (Client HTTP)
  - `@tanstack/react-query` (Caching & Quản lý trạng thái server)
  - `xlsx` (Nhập/Xuất Excel)
  - `recharts` (Biểu đồ, trực quan hóa dữ liệu)

---

## Hướng dẫn chạy dự án (Getting Started)

### 1. Yêu cầu hệ thống
- Máy tính đã cài đặt **Node.js** (phiên bản 18+ khuyến nghị).
- Trình quản lý gói `npm` (hoặc `yarn`, `pnpm`).

### 2. Cài đặt các biến môi trường
Mở thư mục gốc của dự án, thiết lập file `.env` nếu có (đảm bảo không bao giờ commit file này lên Git).

### 3. Cài đặt Dependencies
```bash
npm install
```

### 4. Khởi chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ `http://localhost:5173`.

### 5. Xây dựng bản Production (Build)
```bash
npm run build
```
*(Thư mục sau khi build sẽ nằm ở `./dist`)*

---

## Thiết kế UI/UX
Dự án được chăm chút rất kỹ về mặt UI/UX để mang lại cảm giác thân thiện và "Premium":
- Cấu trúc Header & Toolbar: Bộ chọn bộ lọc, công cụ tìm kiếm và các nút hành động (Tạo mới, Xóa) được tổ chức ngăn nắp, phản hồi tốt trên nhiều kích thước màn hình.
- Trải nghiệm liền mạch nhờ Global Context kết nối mọi trang quản lý thông qua bối cảnh thời gian cụ thể (Năm học + Học kỳ).
