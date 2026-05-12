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
    },
    management: {
        label: "Quản lý",
        accent: "#1e2f5a"
    },
    manager: {
        label: "Quản lý",
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
        name: "Quản trị viên",
        email: "admin@eduvn.edu.vn",
        roleDescription: [],
        achievements: [],
        permissions: []
    },
    management: {
        name: "Cán bộ Quản lý",
        email: "manager@eduvn.edu.vn",
        roleDescription: [],
        achievements: [],
        permissions: []
    }
}

DEFAULT_PROFILE_BY_ROLE.manager = DEFAULT_PROFILE_BY_ROLE.management;

export function getProfileByRole(role, profile) {
    const defaultProfile = DEFAULT_PROFILE_BY_ROLE[role] || DEFAULT_PROFILE_BY_ROLE.student;
    
    // [FIX] Profile from server comes as { ..., profile: { real_data } }
    // We need to flatten it for the UI components
    const serverProfileDetails = profile?.profile || {};
    
    // Merge order: Default < Base User Info < Server Profile Details
    const mergedProfile = {
        ...defaultProfile,
        ...(profile || {}),
        ...serverProfileDetails
    };

    // Mapping fields if they exist in the incoming profile but not in the default schema
    if (profile?.fullName && !profile.name) {
        mergedProfile.name = profile.fullName;
    }

    // [NEW] Prioritize server-side data for teachers/students
    if (serverProfileDetails.subject) mergedProfile.subject = serverProfileDetails.subject;
    if (serverProfileDetails.homeroomClass) mergedProfile.homeroomClass = serverProfileDetails.homeroomClass;
    if (serverProfileDetails.achievements && Array.isArray(serverProfileDetails.achievements)) {
        mergedProfile.achievements = serverProfileDetails.achievements;
    }

    // Ensure permissions are correctly prioritized if they exist in profile
    if (profile?.permissions && Array.isArray(profile.permissions)) {
        mergedProfile.permissions = profile.permissions;
    }

    return mergedProfile;
}


