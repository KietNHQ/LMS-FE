import {
    FiGrid,
    FiBookOpen,
    FiClipboard,
    FiAward,
    FiBell,
    FiCalendar,
    FiHelpCircle,
    FiUser,
    FiUsers,
    FiBarChart2,
    FiHome,
    FiFileText,
    FiSettings,
    FiMessageSquare,
    FiTrendingUp,
    FiCreditCard,
    FiStar,
    FiShield,
    FiCheckSquare,
    FiUpload,
    FiDownload,
    FiAlertTriangle,
    FiAlertCircle,
    FiUnlock,
    FiActivity,
    FiBookmark,
    FiEye,
    FiList,
    FiUserCheck,
    FiDollarSign,
    FiRepeat,
    FiPrinter,
    FiMap
} from "react-icons/fi";
import { LuUserCog } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";

export const PERMISSIONS = {
    // 1. Nhóm Người dùng (User)
    USER_VIEW: 'users:read',
    USER_CREATE: 'users:create',
    USER_UPDATE: 'users:update',
    USER_DELETE: 'users:delete',
    USER_LOCK: 'users:update',
    USER_IMPORT: 'import:create',
    USER_ASSIGN_PERMISSION: 'users:assign_role',
    SYSTEM_LOG_VIEW: 'audit_logs:read',
    PERMISSION_AUDIT_VIEW: 'audit_logs:sensitive',

    // 2. Nhóm Lớp học (Class)
    CLASS_VIEW: 'class_allocation:read',
    CLASS_CREATE: 'class_allocation:create',
    CLASS_UPDATE: 'class_allocation:update',
    CLASS_DELETE: 'class_allocation:update',
    CLASS_VIEW_OWN: 'class_allocation:read',

    // 3. Nhóm Nề nếp (Discipline)
    DISCIPLINE_VIEW: 'discipline:read',
    DISCIPLINE_CREATE: 'discipline:create',
    DISCIPLINE_UPDATE: 'discipline:create',
    DISCIPLINE_PROCESS: 'discipline:approve',
    DISCIPLINE_DELETE: 'discipline:create',
    DISCIPLINE_EXPORT: 'discipline:export',
    COMPETITION_MANAGE: 'discipline:read',

    // 4. Nhóm Điểm số (Grade)
    GRADE_VIEW: 'grades:read',
    GRADE_UPDATE: 'grades:update',
    GRADE_APPROVE: 'grades:finalize',
    GRADE_REMIND: 'grades:read',
    GRADE_AUDIT_VIEW: 'audit_logs:sensitive',
    GRADE_EXPORT: 'grades:export',
    GRADE_VIEW_OWN: 'grades:read',

    // 5. Nhóm Kiểm tra (Quiz)
    QUIZ_VIEW: 'exam:read',
    QUIZ_CREATE: 'exam:create',
    QUIZ_UPDATE: 'exam:update',
    QUIZ_DELETE: 'exam:delete',
    QUIZ_PUBLISH: 'exam:update',

    // 6. Nhóm TKB (Timetable)
    TIMETABLE_VIEW: 'class_allocation:read',
    TIMETABLE_CREATE: 'class_allocation:create',
    TIMETABLE_UPDATE: 'class_allocation:update',
    TIMETABLE_DELETE: 'class_allocation:update',
    TIMETABLE_RESOLVE_CONFLICT: 'class_allocation:update',
    SCHEDULE_VIEW_OWN: 'class_allocation:read',

    // 7. Nhóm Tài chính (Finance)
    FINANCE_TUITION_VIEW: 'fees:read',
    FINANCE_TUITION_UPDATE: 'fees:update',
    FINANCE_TUITION_UPDATE_DUEDATE: 'fees:update',
    FINANCE_TUITION_PUBLISH: 'fees:update',
    FINANCE_VIEW_OWN: 'fees:read',
    
    // 8. Nhóm Thông báo (Notification)
    NOTIFICATION_VIEW: 'notifications:read',
    NOTIFICATION_CREATE: 'notifications:create',
    NOTIFICATION_DELETE: 'notifications:delete',

    // 9. Nhóm Báo cáo (Report)
    REPORT_ACADEMIC_VIEW: 'reports:read',
    REPORT_FINANCE_VIEW: 'reports:read',
    REPORT_DISCIPLINE_VIEW: 'reports:read',

    // 10. Nhóm Phòng thi & Coi thi (Exam Session)
    EXAM_SESSION_MANAGE: 'exam:create',
    EXAM_PROCTOR_MANAGE: 'exam:update',

    // 11. Hệ thống & Cài đặt (System)
    SYSTEM_SETTING_UPDATE: 'system_config:update',
    
    // Core Basic (dành cho các user cơ bản)
    TEACHER_BASIC: 'grades:read',
    STUDENT_VIEW_OWN: 'grades:read',
    STUDENT_MONITOR: 'discipline:read',
    STUDENT_ACADEMIC_VICE: 'grades:read',
    PARENT_VIEW_OWN: 'grades:read',
    ATTENDANCE_VIEW_OWN: 'attendance:read',
};

// Map các tính năng Sidebar với Permission tương ứng.
// Khi BE & FE hợp nhất layout xong, ta chỉ cần gọi mảng này và filter theo user.permissions
export const permissionSidebarMap = [
    // --- QUẢN TRỊ ADMIN ---
    { label: "Trang chủ Admin", icon: FiGrid, path: "/admin/dashboard", permissions: [] }, // Mặc định ai có role admin sẽ thấy
    { label: "Người Dùng", icon: LuUserCog, path: "/admin/users", permissions: [PERMISSIONS.USER_VIEW] },
    { label: "Nhật Ký Hệ Thống", icon: FiShield, path: "/principal/audit-logs", permissions: [PERMISSIONS.SYSTEM_LOG_VIEW] },
    
    // --- NGHIỆP VỤ (STAFF) ---
    // Quản lý Đào tạo (Học vụ)
    { label: "Lớp Học", icon: FiBookOpen, path: "/admin/classes", permissions: [PERMISSIONS.CLASS_VIEW] },
    { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/admin/timetable", permissions: [PERMISSIONS.TIMETABLE_VIEW] },
    { label: "Lớp & Điểm Số", icon: FiAward, path: "/vp-academic/grades", permissions: [PERMISSIONS.GRADE_VIEW] },
    { label: "Bài Kiểm Tra", icon: FiFileText, path: "/admin/quiz", permissions: [PERMISSIONS.QUIZ_VIEW] },
    
    // Quản lý Nề nếp (Thi đua)
    { label: "Quản Lý Nề Nếp", icon: FiAlertTriangle, path: "/vp-discipline/discipline-management", permissions: [PERMISSIONS.DISCIPLINE_VIEW] },
    { label: "Quản Lý Thi Đua", icon: FiStar, path: "/admin/competition", permissions: [PERMISSIONS.COMPETITION_MANAGE] },
    
    // Quản lý Tài chính
    { label: "Thanh Toán & Học Phí", icon: FiCreditCard, path: "/admin/payment", permissions: [PERMISSIONS.FINANCE_TUITION_VIEW] },
    
    // --- GIÁO VIÊN ---
    { label: "Trang chủ Giáo viên", icon: FiGrid, path: "/teacher/dashboard", permissions: [PERMISSIONS.TEACHER_BASIC] },
    { label: "Lớp Giảng Dạy", icon: FiBookOpen, path: "/teacher/teaching-classes", permissions: [PERMISSIONS.CLASS_VIEW_OWN] },
    { label: "Quản Lý Điểm", icon: FiAward, path: "/teacher/grades", permissions: [PERMISSIONS.GRADE_UPDATE] },
    { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/teacher/schedule", permissions: [PERMISSIONS.SCHEDULE_VIEW_OWN] },
    
    // --- HỌC SINH ---
    { label: "Điểm Số Của Tôi", icon: FiAward, path: "/student/grades", permissions: [PERMISSIONS.GRADE_VIEW_OWN] },
    { label: "Lịch Học", icon: FiCalendar, path: "/student/schedule", permissions: [PERMISSIONS.STUDENT_VIEW_OWN] },

    // --- PHỤ HUYNH ---
    { label: "Học Tập Con Em", icon: FiTrendingUp, path: "/parent/children-overview", permissions: [PERMISSIONS.PARENT_VIEW_OWN] },
    { label: "Đóng Học Phí", icon: FiCreditCard, path: "/parent/payments", permissions: [PERMISSIONS.FINANCE_VIEW_OWN] },
];
