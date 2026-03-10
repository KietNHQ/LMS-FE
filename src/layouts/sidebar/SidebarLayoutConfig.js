export const sidebarConfig = {
  admin: [
    { label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { label: "Users", icon: "people", path: "/admin/users" },
    { label: "Courses", icon: "menu_book", path: "/admin/courses" },
    { label: "Classes", icon: "class", path: "/admin/classes" },
    { label: "Reports", icon: "bar_chart", path: "/admin/reports" }
  ],

  teacher: [
    { label: "Dashboard", icon: "dashboard", path: "/teacher/dashboard" },
    { label: "My Classes", icon: "class", path: "/teacher/classes" },
    { label: "Lessons", icon: "menu_book", path: "/teacher/lessons" },
    { label: "Quiz", icon: "quiz", path: "/teacher/quiz" },
    { label: "Students", icon: "people", path: "/teacher/students" }
  ],

  student: [
    { label: "Dashboard", icon: "dashboard", path: "/student/dashboard" },
    { label: "Classes", icon: "class", path: "/student/classes" },
    { label: "Grades", icon: "grade", path: "/student/grades" },
    { label: "Quiz", icon: "quiz", path: "/student/quiz" },
    { label: "Notifications", icon: "notifications", path: "/student/notifications" },
    { label: "Schedule", icon: "calendar", path: "/student/schedule" },
    { label: "Support", icon: "help", path: "/student/support" },
    { label: "Profile", icon: "person", path: "/student/profile" }
  ],

  parent: [
    { label: "Dashboard", icon: "dashboard", path: "/parent/dashboard" },
    { label: "Child Progress", icon: "insights", path: "/parent/progress" },
    { label: "Attendance", icon: "event", path: "/parent/attendance" },
    { label: "Messages", icon: "mail", path: "/parent/messages" }
  ]
};