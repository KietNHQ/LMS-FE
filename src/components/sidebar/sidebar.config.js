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
    FiMap
} from "react-icons/fi";
import { LuUserCog } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";

export const roleTheme = {
    admin: {
        label: "Cổng Quản Trị",
        shortLabel: "SA",
        className: "role-admin"
    },
    principal: {
        label: "Cổng Hiệu Trưởng",
        shortLabel: "HT",
        className: "role-admin"
    },
    vp_academic: {
        label: "PHT Chuyên Môn",
        shortLabel: "CM",
        className: "role-admin"
    },
    vp_discipline: {
        label: "PHT Nề Nếp",
        shortLabel: "NN",
        className: "role-admin"
    },
    academic_staff: {
        label: "Cổng Giáo Vụ",
        shortLabel: "GV",
        className: "role-admin"
    },
    finance_staff: {
        label: "Cổng Kế Toán",
        shortLabel: "KT",
        className: "role-admin"
    },
    teacher: {
        label: "Cổng Giáo Viên",
        shortLabel: "G",
        className: "role-teacher"
    },
    student: {
        label: "Cổng Học Sinh",
        shortLabel: "H",
        className: "role-student"
    },
    parent: {
        label: "Cổng Phụ Huynh",
        shortLabel: "P",
        className: "role-parent"
    }
};

export const sidebarConfig = {
    // ── SUPER ADMIN ─────────────────────────────────────────────────
    admin: [
        { label: "Trang chủ", icon: FiGrid, path: "/admin/dashboard" },
        { label: "Người Dùng", icon: LuUserCog, path: "/admin/users" },
        { label: "Lớp Học", icon: FiBookOpen, path: "/admin/classes" },
        { label: "Điểm thi đua", icon: FiStar, path: "/admin/competition" },
        { label: "Bài Kiểm Tra", icon: FiFileText, path: "/admin/quiz" },
        { label: "Thanh Toán", icon: FiCreditCard, path: "/admin/payment" },
        { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/admin/timetable" },
        { label: "Thông Báo", icon: FiBell, path: "/admin/notifications" },
        { label: "Báo Cáo", icon: FiBarChart2, path: "/admin/reports" }
    ],

    // ── HIỆU TRƯỞNG ─────────────────────────────────────────────────
    principal: [
        { label: "Trang chủ",          icon: FiGrid,        path: "/principal/dashboard" },
        { label: "Theo Dõi Tổng Hợp",   icon: FiEye,         path: "/principal/overview" },
        { label: "Phê Duyệt",           icon: FiCheckSquare, path: "/principal/approvals" },
        { label: "Báo Cáo",             icon: FiBarChart2,   path: "/principal/reports" },
        { label: "Nhật Ký Hệ Thống",    icon: FiShield,      path: "/principal/audit-logs" },
        { label: "Thông Báo",           icon: FiBell,        path: "/principal/notifications" },
    ],

    // ── PHÓ HIỆU TRƯỞNG CHUYÊN MÔN ─────────────────────────────────
    vp_academic: [
        { label: "Trang chủ",           icon: FiGrid,      path: "/vp-academic/dashboard" },
        { label: "Lớp & Điểm Số",       icon: FiAward,     path: "/vp-academic/grades" },
        { label: "Phê Duyệt & Mở Khóa", icon: FiUnlock,    path: "/vp-academic/approvals" },
        { label: "Kỳ Thi",              icon: FiCalendar,  path: "/vp-academic/exams" },
        { label: "Thời Khóa Biểu",      icon: FiList,      path: "/vp-academic/timetable" },
        { label: "Phân Công Giảng Dạy",icon: FiUserCheck, path: "/vp-academic/teaching-assignment" },
        { label: "Quản Lý Dữ Liệu",   icon: FiUpload,    path: "/vp-academic/data-management" },
        { label: "Thông Báo",           icon: FiBell,      path: "/vp-academic/notifications" },
    ],

    // ── PHÓ HIỆU TRƯỞNG NỀ NẾP ─────────────────────────────────────
    vp_discipline: [
        { label: "Trang chủ",       icon: FiGrid,          path: "/vp-discipline/dashboard" },
        { label: "Quản Lý Nề Nếp",  icon: FiAlertTriangle, path: "/vp-discipline/discipline-management" },
        { label: "Xếp Hạng Thi Đua",icon: FiStar,          path: "/vp-discipline/competition" },
        { label: "Chuyên Cần",      icon: FiActivity,      path: "/vp-discipline/attendance" },
        { label: "Hạnh Kiểm",       icon: FiAward,         path: "/vp-discipline/conduct" },
        { label: "Thông Báo",       icon: FiBell,          path: "/vp-discipline/notifications" },
    ],

    // ── GIÁO VỤ ─────────────────────────────────────────────────────
    academic_staff: [
        { label: "Trang chủ",         icon: FiGrid,             path: "/academic/dashboard" },
        { label: "Nhân Sự",           icon: FiUsers,            path: "/academic/personnel" },
        { label: "Lớp & Giảng Dạy",   icon: FiBookOpen,         path: "/academic/class-management" },
        { label: "Thời Khóa Biểu",   icon: FiCalendar,         path: "/academic/timetable" },
        { label: "Học Bạ",            icon: FiBookmark,         path: "/academic/academic-records" },
        { label: "Import / Export",  icon: FiUpload,           path: "/academic/import" },
        { label: "Thông Báo",         icon: FiBell,             path: "/academic/notifications" },
    ],

    // ── KẾ TOÁN ─────────────────────────────────────────────────────
    finance_staff: [
        { label: "Trang chủ",           icon: FiGrid,       path: "/finance/dashboard" },
        { label: "Quản Lý Thu Phí",    icon: FiCreditCard, path: "/finance/fee-management" },
        { label: "Thanh Toán & Hóa Đơn",icon: FiRepeat,     path: "/finance/payment-hub" },
        { label: "Báo Cáo Tài Chính",   icon: FiBarChart2,  path: "/finance/reports" },
        { label: "Thông Báo",           icon: FiBell,       path: "/finance/notifications" },
    ],

    teacher: [
        { label: "Trang chủ", icon: FiGrid, path: "/teacher/dashboard" },
        { label: "Lớp Giảng Dạy", icon: FiBookOpen, path: "/teacher/teaching-classes" },
        { label: "Lớp Chủ Nhiệm", icon: FiHome, path: "/teacher/homeroom" },
        { label: "Bài Học", icon: FiClipboard, path: "/teacher/lessons" },
        { label: "Quản Lý Điểm", icon: FiAward, path: "/teacher/grades" },
        { label: "Bài Kiểm Tra", icon: FiFileText, path: "/teacher/quiz" },
        { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/teacher/schedule" },
        { label: "Thông Báo", icon: FiBell, path: "/teacher/notifications" },
        { label: "Hỗ Trợ", icon: FiHelpCircle, path: "/teacher/support" },
    ],

    student: [
        { label: "Trang chủ", icon: FiGrid, path: "/student/dashboard" },
        { label: "Lớp Học", icon: FiBookOpen, path: "/student/classes" },
        { label: "Điểm Số", icon: FiAward, path: "/student/grades" },
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