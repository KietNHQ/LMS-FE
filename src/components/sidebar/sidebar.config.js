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
    FiStar
} from "react-icons/fi";
import { LuUserCog } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";

export const roleTheme = {
    admin: {
        label: "Cổng Quản Trị",
        shortLabel: "Q",
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
    admin: [
        { label: "Trang chủ", icon: FiGrid, path: "/admin/dashboard" },
        { label: "Người Dùng", icon: LuUserCog, path: "/admin/users" },
        { label: "Giáo Viên", icon: FaChalkboardTeacher, path: "/admin/teachers" },
        { label: "Học Sinh", icon: PiStudentBold, path: "/admin/students" },
        { label: "Phụ Huynh", icon: RiParentFill, path: "/admin/parents" },
        { label: "Lớp Học", icon: FiBookOpen, path: "/admin/classes" },
        { label: "Điểm thi đua", icon: FiStar, path: "/admin/competition" },
        { label: "Bài Kiểm Tra", icon: FiFileText, path: "/admin/quiz" },
        { label: "Thanh Toán", icon: FiCreditCard, path: "/admin/payment" },
        { label: "Thời Khóa Biểu", icon: FiCalendar, path: "/admin/timetable" },
        { label: "Thông Báo", icon: FiBell, path: "/admin/notifications" },
        { label: "Báo Cáo", icon: FiBarChart2, path: "/admin/reports" }
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