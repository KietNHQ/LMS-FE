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
        { label: "My Courses", icon: "menu_book", path: "/student/courses" },
        { label: "Assignments", icon: "assignment", path: "/student/assignments" },
        { label: "Quiz", icon: "quiz", path: "/student/quiz" },
        { label: "Progress", icon: "insights", path: "/student/progress" }
    ],

    parent: [
        { label: "Dashboard", icon: "dashboard", path: "/parent/dashboard" },
        { label: "Child Progress", icon: "insights", path: "/parent/progress" },
        { label: "Attendance", icon: "event", path: "/parent/attendance" },
        { label: "Messages", icon: "mail", path: "/parent/messages" }
    ]

};