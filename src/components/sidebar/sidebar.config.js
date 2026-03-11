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
    FiCreditCard
} from "react-icons/fi";

export const roleTheme = {
    admin: {
        label: "Admin Portal",
        shortLabel: "A",
        className: "role-admin"
    },
    teacher: {
        label: "Teacher Portal",
        shortLabel: "T",
        className: "role-teacher"
    },
    student: {
        label: "Student Portal",
        shortLabel: "S",
        className: "role-student"
    },
    parent: {
        label: "Parent Portal",
        shortLabel: "P",
        className: "role-parent"
    }
};

export const sidebarConfig = {
    admin: [
        { label: "Dashboard", icon: FiGrid, path: "/admin/dashboard" },
        { label: "Users", icon: FiUsers, path: "/admin/users" },
        { label: "Teachers", icon: FiUsers, path: "/admin/teachers" },
        { label: "Students", icon: FiUsers, path: "/admin/students" },
        { label: "Parents", icon: FiUsers, path: "/admin/parents" },
        { label: "Classes", icon: FiBookOpen, path: "/admin/classes" },
        { label: "Reports", icon: FiBarChart2, path: "/admin/reports" },
        { label: "Settings", icon: FiSettings, path: "/admin/settings" }
    ],

    teacher: [
        { label: "Dashboard", icon: FiGrid, path: "/teacher/dashboard" },
        { label: "Teaching Classes", icon: FiBookOpen, path: "/teacher/teaching-classes" },
        { label: "Homeroom", icon: FiHome, path: "/teacher/homeroom" },
        { label: "Lessons", icon: FiClipboard, path: "/teacher/lessons" },
        { label: "Grades", icon: FiAward, path: "/teacher/grades" },
        { label: "Quiz", icon: FiFileText, path: "/teacher/quiz" },
        { label: "Schedule", icon: FiCalendar, path: "/teacher/schedule" },
        { label: "Request", icon: FiMessageSquare, path: "/teacher/request" },
        { label: "Notifications", icon: FiBell, path: "/teacher/notifications" },
        { label: "Support", icon: FiHelpCircle, path: "/teacher/support" },
        { label: "Profile", icon: FiUser, path: "/teacher/profile" }
    ],

    student: [
        { label: "Dashboard", icon: FiGrid, path: "/student/dashboard" },
        { label: "Classes", icon: FiBookOpen, path: "/student/classes" },
        { label: "Grades", icon: FiAward, path: "/student/grades" },
        { label: "Quiz", icon: FiFileText, path: "/student/quiz" },
        { label: "Notifications", icon: FiBell, path: "/student/notifications" },
        { label: "Schedule", icon: FiCalendar, path: "/student/schedule" },
        { label: "Support", icon: FiHelpCircle, path: "/student/support" },
        { label: "Profile", icon: FiUser, path: "/student/profile" }
    ],

    parent: [
        { label: "Dashboard", icon: FiGrid, path: "/parent/dashboard" },
        { label: "Children Overview", icon: FiTrendingUp, path: "/parent/children-overview" },
        { label: "Notifications", icon: FiBell, path: "/parent/notifications" },
        { label: "Messages", icon: FiMessageSquare, path: "/parent/messages" },
        { label: "Payments", icon: FiCreditCard, path: "/parent/payments" },
        { label: "Support", icon: FiHelpCircle, path: "/parent/support" }
    ]
};