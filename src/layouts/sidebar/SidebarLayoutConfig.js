import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  BarChart3,

  Book,
  FileText,
  Bell,
  HelpCircle,
  ClipboardList,

  Award,
  Wallet,
  MessageCircle
} from "lucide-react";

export const sidebarLayoutConfig = {
  admin: {
  color: "#243A6B",
  menu: [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },

    { name: "Người dùng", path: "/admin/users", icon: Users },

    { name: "Học sinh", path: "/admin/students", icon: GraduationCap },

    { name: "Lớp học", path: "/admin/classes", icon: School },

    { name: "Môn học", path: "/admin/subjects", icon: BookOpen },

    { name: "Thời khóa biểu", path: "/admin/schedule", icon: CalendarDays },

    { name: "Điểm danh", path: "/admin/attendance", icon: ClipboardCheck },

    { name: "Thống kê điểm", path: "/admin/statistics", icon: BarChart3 },

    { name: "Quiz", path: "/admin/quiz", icon: ClipboardList },

    { name: "Bài học", path: "/admin/lessons", icon: Book },

    { name: "Hóa đơn", path: "/admin/invoices", icon: Wallet },

    { name: "Thông báo", path: "/admin/notifications", icon: Bell },

    { name: "Tickets", path: "/admin/tickets", icon: FileText },

    { name: "Hỗ trợ", path: "/admin/support", icon: HelpCircle },
  ],
},
  teacher: {
    color: "#0F766E",
    menu: [
      { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },

      { name: "Lớp đang dạy", path: "/teacher/classes", icon: School },

      { name: "Nhập điểm", path: "/teacher/grades", icon: FileText },

      { name: "Điểm danh", path: "/teacher/attendance", icon: ClipboardCheck },

      { name: "Quiz", path: "/teacher/quiz", icon: ClipboardList },

      { name: "Bài học", path: "/teacher/lessons", icon: Book },

      { name: "Thông báo", path: "/teacher/notifications", icon: Bell },

      { name: "Hỗ trợ", path: "/teacher/support", icon: HelpCircle },
    ],
  },

  student: {
    color: "#3B82F6",
    menu: [
      { name: "Dashboard", path: "/student", icon: LayoutDashboard },

      { name: "Xem điểm", path: "/student/grades", icon: Award },

      { name: "Thời khóa biểu", path: "/student/schedule", icon: CalendarDays },

      { name: "Bài học", path: "/student/lessons", icon: Book },

      { name: "Quiz", path: "/student/quiz", icon: ClipboardList },

      { name: "Thông báo", path: "/student/notifications", icon: Bell },

      { name: "Hỗ trợ", path: "/student/support", icon: HelpCircle },
    ],
  },

  parent: {
    color: "#7C3AED",
    menu: [
      { name: "Dashboard", path: "/parent", icon: LayoutDashboard },

      { name: "Kết quả học tập", path: "/parent/results", icon: Award },

      { name: "Học bạ", path: "/parent/report", icon: BookOpen },

      { name: "Học phí", path: "/parent/tuition", icon: Wallet },

      { name: "Thông báo", path: "/parent/notifications", icon: Bell },

      { name: "Cộng đồng", path: "/parent/community", icon: MessageCircle },

      { name: "Hỗ trợ", path: "/parent/support", icon: HelpCircle },
    ],
  },
};