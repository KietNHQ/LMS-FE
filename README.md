# EduVN LMS - Frontend Application

> **Dự án**: Hệ thống quản lý học tập EduVN LMS (Phân hệ Frontend)
> **Mục tiêu**: Áp dụng các công nghệ Web hiện đại để xây dựng giao diện người dùng tương tác cao, quản lý phân quyền phức tạp cho hệ sinh thái trường học.

---

## 1. Tổng Quan Dự Án (Project Overview)

**EduVN LMS** là một nền tảng chuyển đổi số toàn diện dành cho các cơ sở giáo dục. Hệ thống được thiết kế để số hóa và tối ưu hóa toàn bộ quy trình nghiệp vụ: từ quản lý nhân sự, học vụ, xếp thời khóa biểu, tổ chức thi cử đến tương tác giữa Nhà trường - Giáo viên - Học sinh - Phụ huynh.

Phân hệ Frontend được xây dựng dưới dạng **Single Page Application (SPA)**, đóng vai trò là điểm chạm trực tiếp với người dùng. Yêu cầu đặt ra là phải có trải nghiệm mượt mà (UX), giao diện hiện đại (UI), xử lý lượng lớn dữ liệu (bảng điểm, danh sách hàng ngàn học sinh) mà không bị giật lag, và tính bảo mật cao thông qua cơ chế kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC).

---

## 2. Tính Năng Chi Tiết Phân Theo Vai Trò (Key Features by Role)

Dự án áp dụng mô hình phân quyền đa tầng khắt khe. Tùy thuộc vào Token đăng nhập, hệ thống sẽ tự động điều hướng người dùng vào các Workspace riêng biệt:

### 2.1. Quản Trị Viên Hệ Thống (Admin)
Đóng vai trò là Super User, quản lý hạ tầng và bảo mật của toàn hệ thống.
- **Quản lý Định danh & Phân quyền (Identity Management)**: CRUD tài khoản (Giáo viên, Học sinh, Phụ huynh, Giáo vụ). Cấp phát và thu hồi quyền hạn. Tự động sinh mật khẩu ngẫu nhiên cho người dùng mới và yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
- **Phân công chuyên môn (Teacher Assignment)**: Giao diện Drag & Drop / Select đa tầng để gán giáo viên vào các tổ bộ môn và phân công trách nhiệm giảng dạy cho từng lớp.
- **Giám sát hệ thống (System Logs & Audit)**: Giao diện log thời gian thực theo dõi mọi hành động (Ai làm gì, vào lúc nào, địa chỉ IP nào) để phục vụ tra soát (Audit).
- **Cấu hình hệ thống**: Thiết lập tham số toàn cục, quản lý danh mục (Categories), gửi thông báo khẩn cấp (System Broadcast).

### 2.2. Ban Giám Hiệu & Giáo Vụ (Management)
Đây là phân hệ đồ sộ nhất, phục vụ việc vận hành nhà trường hàng ngày.
- **Quản lý Học vụ (Academic Management)**: Khởi tạo dữ liệu đầu năm học: Thiết lập năm học, học kỳ, khối lớp, môn học.
- **Quản lý Tổ chức Lớp học**: Xếp lớp tự động hoặc thủ công. Thuyên chuyển học sinh giữa các lớp. Chỉ định/Thay đổi giáo viên chủ nhiệm.
- **Quản lý Kỳ thi & Điểm số (Exam & Grading)**:
  - Lên lịch các kỳ thi tập trung (Giữa kỳ, Cuối kỳ).
  - **Thuật toán xếp phòng thi (Exam Room Assignment)**: Tự động chia học sinh vào các phòng thi dựa trên số báo danh (SBD) và sức chứa của phòng.
  - Quản lý khung điểm chuẩn và barem điểm.
- **Quản lý Thời khóa biểu**: Lên lịch học, phân bổ tiết dạy cho giáo viên, tích hợp cảnh báo trùng lịch.
- **Quản lý Nề nếp & Thi đua**: Ghi nhận các vi phạm kỷ luật của học sinh/lớp. Hệ thống tự động tính điểm thi đua và xếp hạng lớp theo tuần/tháng.
- **Tài chính & Học phí**: Theo dõi công nợ, quản lý các khoản thu hộ/chi hộ, xuất báo cáo tài chính ra file Excel.

### 2.3. Giáo Viên (Teacher)
- **Không gian Giảng dạy**: Xem thời khóa biểu cá nhân. Tải lên tài liệu bài giảng.
- **Đánh giá & Khảo thí**: Nhập điểm định kỳ vào sổ điểm điện tử. Soạn thảo bài kiểm tra trắc nghiệm (Quiz) và giao cho học sinh làm online, hệ thống tự động chấm điểm.
- **Công tác Chủ nhiệm**: Xem báo cáo tổng hợp về học lực, hạnh kiểm của lớp chủ nhiệm. Điểm danh hàng ngày.
- **Kênh Tương tác**: Chat trực tiếp với học sinh hoặc nhắn tin thông báo đến phụ huynh.

### 2.4. Học Sinh (Student)
- **Bảng điều khiển cá nhân (Dashboard)**: Xem thời khóa biểu trong tuần, thông báo mới từ nhà trường.
- **Học tập & Thi cử**: Tham gia làm bài tập về nhà, thi trắc nghiệm trực tuyến (tích hợp đồng hồ đếm ngược và chống gian lận cơ bản chuyển tab).
- **Tiến độ học tập**: Theo dõi sổ liên lạc điện tử, xem biểu đồ phân tích năng lực (Radar chart) các môn học.

### 2.5. Phụ Huynh (Parent)
- **Giám sát**: Xem điểm số theo thời gian thực ngay khi giáo viên nhập điểm. Theo dõi điểm danh (vắng phép/không phép).
- **Hành chính**: Nhận giấy báo học phí điện tử. Đọc các thông báo từ Ban giám hiệu.

---

## 3. Kiến Trúc Kỹ Thuật & Ngăn Xếp Công Nghệ (Technical Architecture & Stack)

Hệ thống Frontend được thiết kế để xử lý nghiệp vụ phức tạp, ưu tiên hiệu năng (Performance) và khả năng mở rộng (Scalability).

### Ngăn Xếp Công Nghệ Cốt Lõi
| Công nghệ / Thư viện | Vai trò cốt lõi trong kiến trúc |
| :--- | :--- |
| **React 19** | Component-based UI. Tận dụng tối đa Hooks để tách biệt logic. |
| **Vite** | Module bundler & Dev Server. Giúp thời gian Hot Module Replacement (HMR) giảm xuống chỉ còn vài mili-giây. |
| **React Router v7** | Xử lý định tuyến Client-side. Tích hợp các **Protected Routes** để chặn truy cập trái phép ở cấp độ Component. |
| **TanStack Query v5** | Quản lý **Server State**. Thay vì dùng Redux cồng kềnh, Query tự động xử lý Data Fetching, Caching, Deduping requests, và Background updates. |
| **Context API** | Quản lý **Client State** toàn cục: Trạng thái Theme (Dark/Light mode), Trạng thái Xác thực (AuthContext) chứa thông tin người dùng đang đăng nhập. |

### Các Thư Viện Hỗ Trợ Giao Diện & Tiện Ích
| Công nghệ / Thư viện | Ứng dụng thực tế |
| :--- | :--- |
| **Axios** | HTTP Client. Được cấu hình **Interceptors** để tự động đính kèm `Bearer Token` vào mọi request, và tự động xử lý Logic Refresh Token khi gặp lỗi `401 Unauthorized`. |
| **Material UI (MUI)** | Cung cấp các Component phức tạp (DataGrid, Dialog, Select, Stepper) theo chuẩn Material Design. Được custom lại bằng hệ thống Theme (Navy Blue & Emerald). |
| **Recharts** | Vẽ biểu đồ (BarChart, LineChart, PieChart) trực quan tại trang Dashboard của Management và Học sinh. |
| **XLSX** | Xử lý nghiệp vụ Import danh sách học sinh từ file Excel và Export bảng điểm chuẩn hóa ra file Excel. |
| **React-Toastify**| Hiển thị thông báo (Toast) dạng pop-up ở góc màn hình sau các thao tác CRUD. |

---

## 4. Cấu Trúc Mã Nguồn Chuyên Sâu (Deep-Dive Folder Structure)

Dự án áp dụng mô hình kiến trúc **Feature-based & Layered Architecture**. Logic nghiệp vụ được tách biệt hoàn toàn khỏi tầng giao diện (UI).

```text
src/
├── assets/             # Tài nguyên tĩnh
│   ├── images/         # Ảnh nền, logo
│   └── fonts/          # Font chữ custom (nếu có)
├── components/         # UI Components dùng chung
│   ├── common/         # Nút bấm, Input, Modal, Table dùng chung toàn app
│   ├── layout/         # Header, Sidebar, Footer, Breadcrumbs
│   └── specific/       # Các component đặc thù (VD: ExamRoomArranger, UserTable)
├── config/             # Cấu hình ứng dụng
│   ├── constants.js    # Các hằng số (VD: PAGE_SIZE, API_ENDPOINTS)
│   └── theme.js        # Cấu hình biến màu sắc, typography cho MUI
├── context/            # React Context API
│   ├── AuthContext.jsx # Quản lý trạng thái Đăng nhập, Token, Thông tin User
│   └── ThemeContext.jsx# Quản lý chế độ hiển thị (Dark/Light)
├── hooks/              # Custom Hooks tách biệt logic
│   ├── useAuth.js      # Hook truy xuất AuthContext
│   ├── useDebounce.js  # Tối ưu hóa ô tìm kiếm (Search input)
│   └── useAxiosPrivate.js # Hook đính kèm interceptors vào Axios
├── layouts/            # Layout bọc ngoài các trang
│   ├── AdminLayout.jsx # Layout có Sidebar quản trị
│   └── AuthLayout.jsx  # Layout tối giản cho màn hình Login
├── pages/              # Màn hình (Pages)
│   ├── Admin/          # Các trang thuộc quyền Admin
│   ├── Management/     # Các trang thuộc quyền BGH
│   ├── Teacher/        # Các trang thuộc quyền Giáo viên
│   └── Auth/           # Trang Đăng nhập, Quên mật khẩu
├── routes/             # Cấu hình định tuyến
│   ├── index.jsx       # File tổng hợp toàn bộ Routes
│   └── ProtectedRoute.jsx # Component bảo vệ (Guard) check Role và Token
├── services/           # Lớp gọi API (Tương tác với Backend)
│   ├── api.js          # Khởi tạo Axios instance
│   ├── auth.service.js # Call API /login, /refresh-token
│   └── user.service.js # Call API lấy danh sách, thêm, sửa, xóa User
├── styles/             # CSS Toàn cục
│   └── index.css       # Định nghĩa CSS Variables (Màu chủ đạo Navy Blue)
└── utils/              # Hàm tiện ích dùng chung
    ├── formatters.js   # Hàm format ngày tháng (DD/MM/YYYY), tiền tệ (VNĐ)
    └── validators.js   # Hàm check Regex cho Email, Số điện thoại
```

---

## 5. Luồng Dữ Liệu & Quy Trình Xác Thực (Data Flow & Authentication)

1. **Đăng nhập**: Người dùng nhập thông tin tại `/login`. Call API qua `auth.service.js`.
2. **Lưu trữ**: Backend trả về `AccessToken` và thông tin User. Frontend lưu `AccessToken` vào bộ nhớ tạm (hoặc localStorage) và lưu thông tin User vào `AuthContext`.
3. **Điều hướng**: Dựa vào trường `role` của User, `React Router` sẽ tự động redirect về Dashboard tương ứng (VD: `role === 'admin'` -> `/admin`).
4. **Gọi API nghiệp vụ**: Mọi request sau đó (VD: Lấy danh sách học sinh) đều đi qua `useAxiosPrivate`. Tại đây, Interceptor sẽ gắn header `Authorization: Bearer <token>`.
5. **Hết hạn Token (401)**: Nếu Token hết hạn, Interceptor bắt lỗi 401, tự động call API `/refresh-token` bằng HTTPOnly Cookie chứa `RefreshToken` để lấy Token mới, sau đó tự động retry lại request bị lỗi một cách hoàn toàn trong suốt với người dùng.

---

## 6. Hướng Dẫn Cài Đặt Và Vận Hành (Setup & Deployment)

### Yêu Cầu Môi Trường (Prerequisites)
- **Node.js**: Phiên bản `v18.x` hoặc `v20.x` (LTS).
- **NPM** hoặc **Yarn**.
- Đã cài đặt và chạy hệ thống Backend API.

### Các Bước Triển Khai Tại Local

**Bước 1: Clone dự án**
```bash
git clone <repository_url>
cd D:\ThucTapTotNghiep\LMS\FrontEnd\LMS-FE
```

**Bước 2: Cài đặt thư viện**
```bash
npm install
# Hoặc: yarn install
```

**Bước 3: Cấu hình biến môi trường**
Tạo file `.env` ở thư mục gốc (ngang hàng `package.json`):
```env
# Cổng chạy ứng dụng Local
VITE_PORT=5173

# Đường dẫn gốc tới API Backend
VITE_API_BASE_URL=http://localhost:5000/api

# Các thông số phân trang mặc định
VITE_DEFAULT_PAGE_SIZE=10
```

**Bước 4: Khởi chạy môi trường phát triển (Development)**
```bash
npm run dev
```
Truy cập vào ứng dụng tại: `http://localhost:5173`

**Bước 5: Đóng gói ứng dụng (Production Build)**
```bash
# Kiểm tra lỗi cú pháp trước khi build
npm run lint

# Build source code ra file tĩnh HTML/CSS/JS (Nằm ở thư mục /dist)
npm run build

# Chạy server local để xem trước bản build production
npm run preview 
```

---

## 7. Tiêu Chuẩn Viết Code (Coding Guidelines)

Dự án tuân thủ nghiêm ngặt các tiêu chuẩn phát triển phần mềm hiện đại:

1. **Phân tách rạch ròi logic (Separation of Concerns)**:
   - File Component (`.jsx`) TUYỆT ĐỐI không chứa các đoạn code `axios.get(...)`.
   - Mọi thao tác gọi API phải được định nghĩa trong thư mục `src/services/` và được gọi thông qua TanStack Query (sử dụng `useQuery` hoặc `useMutation`).
2. **Quản lý UI/UX nhất quán**:
   - Sử dụng chung một bảng màu (Design System) thông qua biến CSS (CSS Variables) và Theme Context của MUI. Tránh hard-code mã màu tĩnh (ví dụ: `#123456`) vào từng component.
   - Các bảng dữ liệu (Tables) bắt buộc phải có phân trang (Pagination) và hiển thị trạng thái đang tải (Skeleton/Loading Spinner).
3. **Bảo mật Frontend (Security)**:
   - Các route nghiệp vụ đều được bọc bởi `<ProtectedRoute />` kiểm tra chặt chẽ `isAuthenticated` và quyền truy cập `allowedRoles`.
   - Vệ sinh dữ liệu (Sanitize) trước khi hiển thị nếu có sử dụng `dangerouslySetInnerHTML`.
4. **Xử lý Ngoại lệ (Error Handling)**:
   - Bất kỳ lỗi nào trả về từ API (400, 404, 500) đều được bắt lại bằng `try...catch` và thông báo cho người dùng thông qua `react-toastify` với thông điệp thân thiện (Không in log lỗi thô ra màn hình).
