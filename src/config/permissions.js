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
    USER_VIEW: 'user.view',
    USER_CREATE: 'user.create',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    USER_LOCK: 'user.lock',
    USER_IMPORT: 'user.import',
    USER_ASSIGN_PERMISSION: 'user.assign_permission_limited',
    SYSTEM_LOG_VIEW: 'system_log.view',
    PERMISSION_AUDIT_VIEW: 'permission_audit.view',

    // 2. Nhóm Lớp học (Class)
    CLASS_VIEW: 'class.view',
    CLASS_CREATE: 'class.create',
    CLASS_UPDATE: 'class.update',
    CLASS_DELETE: 'class.delete',
    CLASS_VIEW_OWN: 'class.view_own', // Quyền GV xem lớp của mình

    // 3. Nhóm Nề nếp (Discipline)
    DISCIPLINE_VIEW: 'discipline.view',
    DISCIPLINE_CREATE: 'discipline.create',
    DISCIPLINE_UPDATE: 'discipline.update',
    DISCIPLINE_PROCESS: 'discipline.process',
    DISCIPLINE_DELETE: 'discipline.delete',
    DISCIPLINE_HIDE: 'discipline.hide',
    DISCIPLINE_EXPORT: 'discipline.export',
    COMPETITION_MANAGE: 'competition.manage_school',

    // 4. Nhóm Điểm số (Grade)
    GRADE_VIEW: 'grade.view',
    GRADE_UPDATE: 'grade.update',
    GRADE_APPROVE: 'grade.approve',
    GRADE_REMIND: 'grade.remind',
    GRADE_AUDIT_VIEW: 'grade.audit_view',
    GRADE_EXPORT: 'grade.export',
    GRADE_VIEW_OWN: 'grade.view_own', // Học sinh / Phụ huynh

    // 5. Nhóm Kiểm tra (Quiz)
    QUIZ_VIEW: 'quiz.view',
    QUIZ_CREATE: 'quiz.create',
    QUIZ_UPDATE: 'quiz.update',
    QUIZ_DELETE: 'quiz.delete',
    QUIZ_PUBLISH: 'quiz.publish',

    // 6. Nhóm TKB (Timetable)
    TIMETABLE_VIEW: 'timetable.view',
    TIMETABLE_CREATE: 'timetable.create',
    TIMETABLE_UPDATE: 'timetable.update',
    TIMETABLE_DELETE: 'timetable.delete',
    TIMETABLE_RESOLVE_CONFLICT: 'timetable.resolve_conflict',
    SCHEDULE_VIEW_OWN: 'schedule.view_own',

    // 7. Nhóm Tài chính (Finance)
    FINANCE_TUITION_VIEW: 'finance.tuition.view',
    FINANCE_TUITION_UPDATE: 'finance.tuition.update',
    FINANCE_TUITION_UPDATE_DUEDATE: 'finance.tuition.update_duedate',
    FINANCE_TUITION_PUBLISH: 'finance.tuition.publish',
    FINANCE_VIEW_OWN: 'finance.view_own',
    
    // 8. Nhóm Thông báo (Notification)
    NOTIFICATION_VIEW: 'notification.view',
    NOTIFICATION_CREATE: 'notification.create',
    NOTIFICATION_DELETE: 'notification.delete',

    // 9. Nhóm Báo cáo (Report)
    REPORT_ACADEMIC_VIEW: 'report.academic.view',
    REPORT_FINANCE_VIEW: 'report.finance.view',
    REPORT_DISCIPLINE_VIEW: 'report.discipline.view',

    // 10. Nhóm Phòng thi & Coi thi (Exam Session)
    EXAM_SESSION_MANAGE: 'exam.session.manage',
    EXAM_PROCTOR_MANAGE: 'exam.proctor.manage',

    // 11. Hệ thống & Cài đặt (System)
    SYSTEM_SETTING_UPDATE: 'system.setting.update',
    
    // Core Basic (dành cho các user cơ bản)
    TEACHER_BASIC: 'teacher.basic',
    STUDENT_VIEW_OWN: 'student.view_own',
    STUDENT_MONITOR: 'student.monitor',
    STUDENT_ACADEMIC_VICE: 'student.academic_vice',
    PARENT_VIEW_OWN: 'parent.view_own',
    ATTENDANCE_VIEW_OWN: 'attendance.view_own',
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
