# EduVN LMS Frontend

Giao diện web của hệ thống quản lý học tập **EduVN LMS** được xây dựng bằng **React** và **Vite**. Dự án tập trung vào trải nghiệm quản trị theo vai trò, điều hướng rõ ràng và cấu trúc mã nguồn tách bạch giữa các phân hệ nghiệp vụ.

## Tổng quan

Ứng dụng hỗ trợ các không gian làm việc chính:

- **Admin**: quản trị hệ thống, người dùng, thông báo, audit log.
- **Management**: điều hành học vụ và vận hành nhà trường.
- **Teacher**: lớp dạy, bài giảng, điểm số, bài kiểm tra, lịch dạy.
- **Student**: lớp học, điểm số, bài kiểm tra, lịch học, thông báo.
- **Parent**: theo dõi con em, tin nhắn, thanh toán, hỗ trợ.

## Các phân hệ chính

### 1. Xác thực
- Đăng nhập
- Quên mật khẩu
- Đặt lại mật khẩu

### 2. Admin
- Dashboard
- Quản lý người dùng
- Thông báo hệ thống
- Audit log / System log

### 3. Management
Đây là phân hệ chính trong dự án, bao gồm:

- Dashboard tổng quan
- Quản lý người dùng
- Quản lý lớp học và chi tiết lớp
- Quản lý học vụ (`academic`)
- Quản lý nề nếp / kỷ luật
- Quản lý thi đua
- Quản lý điểm số
- Quản lý bài kiểm tra / quiz
- Quản lý kỳ thi và phân phòng thi
- Quản lý thời khóa biểu
- Quản lý tài chính / học phí
- Phê duyệt nghiệp vụ
- Thông báo, báo cáo và chat

### 4. Teacher
- Dashboard giáo viên
- Lớp giảng dạy
- Lớp chủ nhiệm
- Bài giảng / tiết học
- Điểm số
- Quiz
- Lịch dạy
- Hỗ trợ và chat

### 5. Student
- Dashboard học sinh
- Lớp học
- Điểm số
- Bài kiểm tra / quiz
- Thông báo
- Thời khóa biểu
- Ban cán sự lớp
- Hỗ trợ

### 6. Parent
- Dashboard phụ huynh
- Tổng quan con em
- Tin nhắn
- Thông báo
- Thanh toán
- Hỗ trợ

## Công nghệ sử dụng

- **React 19**
- **Vite**
- **React Router DOM v7**
- **@tanstack/react-query**
- **axios**
- **react-toastify**
- **recharts**
- **xlsx**
- **react-icons**, **lucide-react**, **@mui/material**, **@mui/icons-material**
- CSS thuần, tách file theo layout / page / component, sử dụng CSS variables cho theme

## Cấu trúc thư mục chính

```text
src/
├── components/   # Component dùng chung
├── config/       # Cấu hình ứng dụng
├── context/      # Global context
├── hooks/        # Custom hooks
├── layouts/      # Layout theo vai trò
├── pages/        # Màn hình nghiệp vụ
├── routes/       # Khai báo router
├── services/     # Tầng gọi API
├── styles/       # Style dùng chung / global
└── utils/        # Hàm tiện ích
```

## Routing

Ứng dụng sử dụng routing theo vai trò và theo phân hệ:

- `/login`
- `/admin/*`
- `/management/*`
- `/teacher/*`
- `/student/*`
- `/parent/*`

Một số route cũ cũng được redirect tương thích ngược về `/management/*` để tránh gãy liên kết.

## Yêu cầu hệ thống

- **Node.js** 18+ (khuyến nghị)
- **npm**

## Cài đặt và chạy dự án

### 1) Cài dependencies

```bash
npm install
```

### 2) Chạy môi trường phát triển

```bash
npm run dev
```

Mặc định ứng dụng sẽ chạy ở:

```text
http://localhost:5173
```

### 3) Build production

```bash
npm run build
```

### 4) Xem bản build

```bash
npm run preview
```

### 5) Kiểm tra lint

```bash
npm run lint
```

## Quy ước phát triển

- Mỗi vai trò có layout riêng để giữ trải nghiệm nhất quán.
- Các màn hình nghiệp vụ được tách theo module, hạn chế phụ thuộc chéo.
- Global state dùng cho các thông tin dùng chung như **năm học** và **học kỳ**.
- API được tách riêng trong `src/services` để dễ bảo trì.
- CSS ưu tiên tách theo page / component thay vì viết dồn vào một file lớn.

## Ghi chú

- Dự án frontend này kết nối với backend API riêng của LMS.
- Không nên commit file `.env` hoặc thông tin nhạy cảm lên Git.
- Thư mục build sau khi chạy `npm run build` nằm ở `dist/`.

