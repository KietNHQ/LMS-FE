# EduVN LMS - Hệ Thống Quản Lý Học Tập Kỹ Thuật Số (Frontend)

![EduVN Banner](https://img.shields.io/badge/EduVN-LMS-blue?style=for-the-badge&logo=react)
![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite)
![MUI](https://img.shields.io/badge/MUI-7.3-007FFF?style=for-the-badge&logo=mui)

> **EduVN LMS** là giải pháp chuyển đổi số giáo dục toàn diện, tích hợp hệ thống quản lý học tập (LMS), quản lý nghiệp vụ trường học và kênh tương tác đa bên. Dự án được phát triển với tiêu chuẩn **Premium UX/UI**, hệ thống **Multi-Theme** độc đáo và kiến trúc **RBAC** bảo mật tuyệt đối.

---

## 💎 1. Hệ Thống Thiết Kế Đa Dạng (Dynamic Multi-Theme System)

Dự án sở hữu một hệ thống Design Tokens cực kỳ chi tiết (định nghĩa tại `src/styles/variables.css`), cho phép thay đổi toàn bộ diện mạo ứng dụng dựa trên vai trò của người dùng:

- **Admin/Principal Hub**: Tông màu Navy chuyên nghiệp (`#1e2f5a`), tạo sự tin cậy.
- **Teacher Workspace**: Tông màu Teal/Emerald (`#0d9488`), mang lại sự tươi mới và tập trung.
- **Academic/VP Academic**: Tông màu Emerald/Green, nhấn mạnh vào sự tăng trưởng.
- **Finance Staff**: Tông màu Indigo (`#4338ca`), tinh tế và chính xác.
- **Student Portal**: Tông màu Blue năng động (`#2563eb`).
- **Parent Portal**: Tông màu Violet (`#7c3aed`), nhẹ nhàng và thân thiện.

---

## 🛡️ 2. Cơ Chế Bảo Mật & Phân Quyền (RBAC & Protected Routes)

### 2.1. Phân Quyền Theo Resource (Resource-Based Permissions)
Hệ thống không chỉ dựa trên vai trò (Role) mà còn kiểm soát chi tiết qua 17 nhóm quyền hạn (`src/config/permissions.js`), bao gồm:
- **Học vụ**: Lớp học, Phân công lớp, Điểm số, Kỳ thi, Bài kiểm tra.
- **Nghiệp vụ**: Nề nếp, Thi đua, Tổ bộ môn, Điểm danh.
- **Tài chính**: Quản lý học phí, Thông báo công nợ.
- **Hệ thống**: Người dùng, Phân quyền, Nhật ký Audit, Phê duyệt.

### 2.2. ProtectedRoute Mechanism
Component `ProtectedRoute` hoạt động như một lớp lọc thông minh:
- **Auth Guard**: Kiểm tra Access Token và thông tin User trong Storage.
- **Status Guard**: Tự động chặn và đăng xuất các tài khoản bị trạng thái "Vô hiệu hóa".
- **Role Guard**: Tự động điều hướng người dùng về Workspace phù hợp (Admin Dashboard, Teacher Dashboard, v.v.) nếu họ cố tình truy cập trái phép.

---

## 📂 3. Kiến Trúc Mã Nguồn Chuyên Sâu (Deep-Dive Folder Structure)

Dự án tuân thủ nghiêm ngặt mô hình **Modular & Layered Architecture**:

```text
src/
├── components/
│   ├── common/         # Các component dùng chung (Button, Input, ProtectedRoute...)
│   └── layout/         # Các khung layout riêng biệt cho từng vai trò
├── config/             # Cấu hình permissions và các hằng số hệ thống
├── hooks/              # Custom hooks logic (useAuth, useSchoolYearTerm...)
├── layouts/            # Layout bọc (AdminLayout, StudentLayout, ManagementLayout...)
├── pages/
│   ├── admin/          # Quản lý định danh, Users (All, Staff, Teachers, Students, Parents)
│   ├── management/     # Nghiệp vụ BGH (Học vụ, Tài chính, Nề nếp, Thi đua...)
│   ├── teacher/        # Workspace giảng dạy (Sổ điểm, Bài giảng, Quiz...)
│   └── student/parent/ # Cổng thông tin cá nhân dành cho HS & PH
├── services/           # Lớp trừu tượng gọi API
│   ├── pages/          # Logic API riêng biệt cho từng Module trang
│   └── shared/         # Các API dùng chung (Auth, HTTP, Quiz, Payment)
├── styles/             # Hệ thống Design Tokens (variables.css, global.css)
└── utils/              # Helper functions (dateUtils, timetableShared...)
```

---

## 🚀 4. Quy Tắc Phát Triển & Tiêu Chuẩn Code (Coding Standards)

Để đảm bảo dự án luôn sạch và dễ bảo trì, chúng tôi áp dụng các quy tắc:
1. **Separation of Concerns**: Tuyệt đối không chứa logic gọi API trong file JSX. Mọi request phải thông qua lớp `services`.
2. **Server State Mastery**: Sử dụng **TanStack Query** cho mọi thao tác dữ liệu.
   - `useQuery` cho việc lấy dữ liệu (GET).
   - `useMutation` cho việc thay đổi dữ liệu (POST/PUT/DELETE).
3. **Consistent Styling**: Sử dụng biến CSS (`--admin-primary`, `--bg-main`...) thay vì hard-code mã màu.

---

## 🛠️ 5. Hướng Dẫn Vận Hành (Setup & Scripts)

### Cài đặt
1. `git clone <repository_url>`
2. `npm install`

### Biến môi trường (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Các lệnh chính
- `npm run dev`: Khởi chạy môi trường phát triển (Vite).
- `npm run build`: Đóng gói ứng dụng cho Production.
- `npm run lint`: Kiểm tra lỗi cú pháp và tiêu chuẩn code.

---
