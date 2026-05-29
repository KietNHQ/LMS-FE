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
    FiClipboard as FiTask,
    FiMap,
    FiHash,
    FiSun
} from "react-icons/fi";
import { LuUserCog } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";
import { PERMISSIONS } from "../../config/permissions";

export const roleTheme = {
    admin: {
        label: "Cổng Quản Trị",
        shortLabel: "SA",
        className: "theme-admin"
    },
    principal: {
        label: "Cổng Hiệu Trưởng",
        shortLabel: "HT",
        className: "theme-principal"
    },
    vp_academic: {
        label: "PHT Chuyên Môn",
        shortLabel: "CM",
        className: "theme-vp_academic"
    },
    vp_discipline: {
        label: "PHT Nề Nếp",
        shortLabel: "NN",
        className: "theme-vp_discipline"
    },
    academic_staff: {
        label: "Cổng Giáo Vụ",
        shortLabel: "GV",
        className: "theme-academic_staff"
    },
    finance_staff: {
        label: "Cổng Kế Toán",
        shortLabel: "KT",
        className: "theme-finance_staff"
    },
    teacher: {
        label: "Cổng Giáo Viên",
        shortLabel: "G",
        className: "theme-teacher"
    },
    student: {
        label: "Cổng Học Sinh",
        shortLabel: "H",
        className: "theme-student"
    },
    parent: {
        label: "Cổng Phụ Huynh",
        shortLabel: "P",
        className: "theme-parent"
    }
};

export const sidebarConfig = {
    // ── MANAGEMENT (Tất cả cán bộ nhân viên dùng chung 1 menu) ──────────────────
    management: [
        { label: "Trang chủ",          icon: FiGrid,          path: "/management/dashboard" },
        { label: "Người Dùng",         icon: LuUserCog,       path: "/management/users",        requiredPermissions: [PERMISSIONS.USER_VIEW] },
        { label: "Lớp Học",           icon: FiBookOpen,      path: "/management/classes",      requiredPermissions: [PERMISSIONS.CLASS_VIEW] },
        { label: "Quản Lý Điểm Số",    icon: FiAward,         path: "/management/grades",      requiredPermissions: [PERMISSIONS.GRADE_VIEW] },
        { label: "NỀ Nếp & Kỷ Luật", icon: FiAlertTriangle, path: "/management/discipline",   requiredPermissions: [PERMISSIONS.DISCIPLINE_VIEW] },
        { label: "Xếp Lớp & Lên Lớp", icon: FiTrendingUp,   path: "/management/promotion" },
        { label: "Rèn Luyện Hè",      icon: FiSun,           path: "/management/summer-training" },
        { label: "Thi Đua",            icon: FiStar,          path: "/management/competition",  requiredPermissions: [PERMISSIONS.COMPETITION_MANAGE] },
        { label: "Bài Kiểm Tra",       icon: FiFileText,      path: "/management/quiz",         requiredPermissions: [PERMISSIONS.QUIZ_VIEW] },
        { label: "Kỳ Thi",             icon: FiCalendar,      path: "/management/exams",        requiredPermissions: [PERMISSIONS.EXAM_VIEW] },
        { label: "Thời Khóa Biểu",    icon: FiCalendar,      path: "/management/timetable",   requiredPermissions: [PERMISSIONS.TIMETABLE_VIEW] },
        { label: "Học Phí & Tài Chính",icon: FiCreditCard,    path: "/management/finance",     requiredPermissions: [PERMISSIONS.FINANCE_TUITION_VIEW] },
        { label: "  Công nợ chi tiết",  icon: FiAlertCircle,  path: "/management/finance/debts",    requiredPermissions: [PERMISSIONS.FINANCE_TUITION_VIEW] },
        { label: "  Doanh thu",          icon: FiTrendingUp,   path: "/management/finance/revenue",   requiredPermissions: [PERMISSIONS.FINANCE_TUITION_VIEW] },
        { label: "  Lịch sử TT",         icon: FiBarChart2,   path: "/management/finance/payment-history", requiredPermissions: [PERMISSIONS.FINANCE_TUITION_VIEW] },
        { label: "Phê Duyệt",          icon: FiCheckSquare,   path: "/management/approvals",    requiredPermissions: [PERMISSIONS.APPROVAL_REQUEST, PERMISSIONS.APPROVAL_PROCESS] },
        { label: "Trò chuyện",         icon: FiMessageSquare, path: "/management/chat" },
        { label: "Thông Báo",          icon: FiBell,          path: "/management/notifications" },
        { label: "Báo Cáo",            icon: FiBarChart2,     path: "/management/reports",      requiredPermissions: [PERMISSIONS.REPORT_VIEW] },
        { label: "  Xuất Học Bạ",     icon: FiDownload,      path: "/management/discipline/export" },
    ],

    admin: [
        { label: "Trang chủ Admin",     icon: FiGrid,             path: "/admin/dashboard" },
        { label: "Quản Lý Tài Khoản",  icon: LuUserCog,          path: "/admin/users",           requiredPermissions: [PERMISSIONS.USER_VIEW] },
        { label: "Nhật Ký Phân Quyền", icon: FiShield,           path: "/admin/audit-log",       requiredPermissions: [PERMISSIONS.AUDIT_LOG_VIEW] },
        { label: "Log Hệ Thống",       icon: FiActivity,         path: "/admin/system-log",      requiredPermissions: [PERMISSIONS.SYSTEM_LOG_VIEW] },
        { label: "Thông Báo",          icon: FiBell,             path: "/admin/notifications" },
    ],

    teacher: [
        { label: "Trang chủ", icon: FiGrid, path: "/teacher/dashboard" },
        { label: "Lớp Giảng Dạy", icon: FiBookOpen, path: "/teacher/teaching-classes" },
        { label: "Lớp Chủ Nhiệm", icon: FiHome, path: "/teacher/homeroom" },
        { label: "Bài Học", icon: FiClipboard, path: "/teacher/lessons" },
        { label: "Quản Lý Điểm", icon: FiAward, path: "/teacher/grades" },
        { label: "Bài Kiểm Tra", icon: FiFileText, path: "/teacher/quiz" },
        { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/teacher/schedule" },
        { label: "Trò chuyện", icon: FiMessageSquare, path: "/teacher/chat" },
        { label: "Thông Báo", icon: FiBell, path: "/teacher/notifications" },
        { label: "Hỗ Trợ", icon: FiHelpCircle, path: "/teacher/support" },
    ],

    student: [
        { label: "Trang chủ", icon: FiGrid, path: "/student/dashboard" },
        { label: "Lớp Học", icon: FiBookOpen, path: "/student/classes" },
        { label: "Điểm Số", icon: FiAward, path: "/student/grades" },
        { label: "Ban Cán Sự Lớp", icon: FiUsers, path: "/student/class-committee" },
        { label: "Bài Kiểm Tra", icon: FiFileText, path: "/student/quiz" },
        { label: "Thông Báo", icon: FiBell, path: "/student/notifications" },
        { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/student/schedule" },
        { label: "Hỗ Trợ", icon: FiHelpCircle, path: "/student/support" },
    ],

    parent: [
        { label: "Trang chủ", icon: FiGrid, path: "/parent/dashboard" },
        { label: "Tổng Quan Con Em", icon: FiTrendingUp, path: "/parent/children-overview" },
        { label: "Thông Báo", icon: FiBell, path: "/parent/notifications" },
        { label: "Liên lạc giáo viên chủ nhiệm", icon: FiMessageSquare, path: "/parent/messages" },
        { label: "Thanh Toán", icon: FiCreditCard, path: "/parent/payments" },
        { label: "Hỗ Trợ", icon: FiHelpCircle, path: "/parent/support" }
    ]
};
