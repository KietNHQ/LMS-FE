export const ROLE_THEME = {
    student: {
        label: "Học sinh",
        accent: "#2563eb"
    },
    teacher: {
        label: "Giáo viên",
        accent: "#0f766e"
    },
    parent: {
        label: "Phụ huynh",
        accent: "#885def"
    },
    admin: {
        label: "Quản trị viên",
        accent: "#1e2f5a"
    }
}

export const DEFAULT_PROFILE_BY_ROLE = {
    student: {
        name: "Nguyễn Minh Tuấn",
        dob: "12/09/2010",
        address: "Quận 7, TP. HCM",
        homeroomTeacher: "Trần Thị Lan Anh",
        parentName: "Nguyễn Văn Hùng",
        parentPhone: "0903 456 789",
        className: "10A1",
        email: "minhtuan.student@eduvn.edu.vn",
        achievements: [
            "Học sinh giỏi học kỳ I",
            "Giải Nhì Olympic Toán cấp trường",
            "Top 5 lớp về chuyên cần"
        ]
    },
    teacher: {
        name: "Lê Minh Hoàng",
        phone: "0912 778 889",
        subject: "Toán học",
        homeroomClass: "12A2",
        email: "hoang.teacher@eduvn.edu.vn",
        achievements: [
            "Giáo viên dạy giỏi cấp quận 2025",
            "100% học sinh lớp chủ nhiệm đậu tốt nghiệp",
            "Chủ nhiệm lớp tiên tiến xuất sắc"
        ]
    },
    parent: {
        name: "Nguyễn Văn Hùng",
        phone: "0903 456 789",
        address: "Quận 7, TP. HCM",
        childrenCount: 2,
        children: [
            { name: "Nguyễn Minh Tuấn", className: "10A1" },
            { name: "Nguyễn Thị Ngọc Hà", className: "12A2" }
        ],
        email: "phuhuynh.nguyen@familymail.vn"
    },
    admin: {
        name: "Trần Gia Bảo",
        email: "admin@eduvn.edu.vn",
        roleDescription: [
            "Quản lý người dùng, phân quyền và cấu hình hệ thống.",
            "Theo dõi vận hành toàn trường: lớp học, thời khóa biểu, báo cáo.",
            "Giám sát thông báo, dữ liệu học vụ và hỗ trợ kỹ thuật nội bộ."
        ]
    }
}

export function getProfileByRole(role, profile) {
    return {
        ...(DEFAULT_PROFILE_BY_ROLE[role] || DEFAULT_PROFILE_BY_ROLE.student),
        ...(profile || {})
    }
}

