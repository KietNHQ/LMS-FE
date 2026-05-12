export const PERMISSIONS = {
    // 1. Nhóm Người dùng (User)
    USER_VIEW: 'users:read',
    USER_CREATE: 'users:create',
    USER_UPDATE: 'users:update',
    USER_DELETE: 'users:delete',
    
    // 2. Nhóm Lớp học (Class)
    CLASS_VIEW: 'classes:read',
    CLASS_MANAGE: 'classes:manage',
    
    // 2.1 Nhóm Bài học (Lessons)
    LESSONS_VIEW: 'lessons:read',
    LESSONS_CREATE: 'lessons:create',
    LESSONS_UPDATE: 'lessons:update',
    LESSONS_DELETE: 'lessons:delete',
    
    // 3. Nhóm Phân công lớp (Class Allocation)
    CLASS_ALLOCATION_VIEW: 'class_allocation:read',
    CLASS_ALLOCATION_MANAGE: 'class_allocation:manage',

    // 4. Nhóm Điểm số (Grade)
    GRADE_VIEW: 'grades:read',
    GRADE_CREATE: 'grades:create',
    GRADE_FINALIZE: 'grades:finalize',
    GRADE_UNLOCK: 'grades:unlock',

    // 5. Nhóm Kiểm tra (Exam & Quiz)
    EXAM_VIEW: 'exam:read',
    EXAM_MANAGE: 'exam:manage',
    QUIZ_VIEW: 'quiz:read',
    QUIZ_MANAGE: 'quiz:manage',
    
    // 5.1 Nhóm Thời khóa biểu (Timetable)
    TIMETABLE_VIEW: 'timetable:read',
    TIMETABLE_MANAGE: 'timetable:manage',

    // 6. Nhóm Nề nếp (Discipline)
    DISCIPLINE_VIEW: 'discipline:read',
    DISCIPLINE_MANAGE: 'discipline:manage',

    // 7. Nhóm Tài chính (Fees)
    FEES_VIEW: 'fees:read',
    FEES_MANAGE: 'fees:manage',
    FINANCE_TUITION_VIEW: 'fees:read',
    FINANCE_TUITION_MANAGE: 'fees:manage',
    
    // 8. Nhóm Thông báo (Notification)
    NOTIFICATION_VIEW: 'notifications:read',
    NOTIFICATION_MANAGE: 'notifications:manage',

    // 9. Nhóm Giáo viên (Teachers)
    TEACHER_VIEW: 'teachers:read',
    TEACHER_MANAGE: 'teachers:manage',

    // 10. Nhóm Học sinh (Students)
    STUDENT_VIEW: 'students:read',

    // 11. Nhóm Chuyên môn (Departments)
    DEPARTMENT_MANAGE: 'departments:manage',

    // 12. Nhóm Khen thưởng (Reward Types)
    REWARD_TYPE_VIEW: 'reward_types:read',
    REWARD_TYPE_MANAGE: 'reward_types:manage',

    // 13. Nhóm Điểm danh (Attendance)
    ATTENDANCE_VIEW: 'attendance:read',
    ATTENDANCE_MANAGE: 'attendance:manage',

    // 14. Hệ thống (Audit & Permissions)
    AUDIT_LOG_VIEW: 'audit_logs:read',
    PERMISSION_MANAGE: 'permissions:manage',
    DASHBOARD_VIEW: 'dashboard:read',
    
    // 15. Nhóm Báo cáo (Reports)
    REPORT_VIEW: 'reports:read',
    REPORTS_VIEW: 'reports:read',

    // 16. Nhóm Phê duyệt (Approvals)
    APPROVAL_REQUEST: 'approvals:request',
    APPROVAL_PROCESS: 'approvals:process',

    // 17. Nhóm Thi đua (Competition)
    COMPETITION_MANAGE: 'reward_types:manage',
};

export const MANAGEMENT_TITLES = [
    { label: "Tùy chỉnh", value: "custom", permissions: [] },
    { label: "Hiệu trưởng", value: "principal", permissions: Object.values(PERMISSIONS) },
    { label: "Phó hiệu trưởng (Học vụ)", value: "vp_academic", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.CLASS_VIEW, PERMISSIONS.GRADE_VIEW, 
        PERMISSIONS.EXAM_VIEW, PERMISSIONS.TEACHER_VIEW, PERMISSIONS.STUDENT_VIEW
    ] },
    { label: "Phó hiệu trưởng (Nề nếp)", value: "vp_discipline", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.DISCIPLINE_VIEW, PERMISSIONS.DISCIPLINE_MANAGE,
        PERMISSIONS.REWARD_TYPE_VIEW, PERMISSIONS.NOTIFICATION_VIEW
    ] },
    { label: "Giáo vụ", value: "academic_staff", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.CLASS_VIEW, PERMISSIONS.CLASS_ALLOCATION_VIEW,
        PERMISSIONS.STUDENT_VIEW
    ] },
    { label: "Kế toán", value: "finance", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.FEES_VIEW, PERMISSIONS.FEES_MANAGE, PERMISSIONS.DASHBOARD_VIEW
    ] },
    { label: "Tổ trưởng bộ môn", value: "dept_head", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.TEACHER_VIEW, PERMISSIONS.DEPARTMENT_MANAGE, PERMISSIONS.DASHBOARD_VIEW
    ] },
];

export const PERMISSION_GROUPS = [
    {
        id: "users",
        label: "Người dùng & Hệ thống",
        permissions: [
            { id: PERMISSIONS.USER_VIEW, label: "Xem người dùng" },
            { id: PERMISSIONS.USER_CREATE, label: "Thêm người dùng" },
            { id: PERMISSIONS.USER_UPDATE, label: "Sửa người dùng" },
            { id: PERMISSIONS.USER_DELETE, label: "Xóa người dùng" },
            { id: PERMISSIONS.PERMISSION_MANAGE, label: "Quản lý phân quyền" },
            { id: PERMISSIONS.AUDIT_LOG_VIEW, label: "Xem nhật ký hệ thống" },
            { id: PERMISSIONS.DASHBOARD_VIEW, label: "Xem Dashboard" },
        ]
    },
    {
        id: "academic",
        label: "Đào tạo & Lớp học",
        permissions: [
            { id: PERMISSIONS.CLASS_VIEW, label: "Xem danh sách lớp" },
            { id: PERMISSIONS.CLASS_MANAGE, label: "Quản lý lớp học" },
            { id: PERMISSIONS.CLASS_ALLOCATION_VIEW, label: "Xem phân công lớp" },
            { id: PERMISSIONS.CLASS_ALLOCATION_MANAGE, label: "Quản lý phân công" },
            { id: PERMISSIONS.LESSONS_VIEW, label: "Xem bài học" },
            { id: PERMISSIONS.LESSONS_CREATE, label: "Tạo bài học" },
            { id: PERMISSIONS.LESSONS_UPDATE, label: "Sửa bài học" },
            { id: PERMISSIONS.LESSONS_DELETE, label: "Xóa bài học" },
        ]
    },
    {
        id: "grades",
        label: "Điểm số & Kỳ thi",
        permissions: [
            { id: PERMISSIONS.GRADE_VIEW, label: "Xem điểm số" },
            { id: PERMISSIONS.GRADE_CREATE, label: "Nhập điểm số" },
            { id: PERMISSIONS.GRADE_FINALIZE, label: "Khóa điểm" },
            { id: PERMISSIONS.EXAM_VIEW, label: "Xem kỳ thi" },
            { id: PERMISSIONS.EXAM_MANAGE, label: "Quản lý kỳ thi" },
            { id: PERMISSIONS.QUIZ_VIEW, label: "Xem bài kiểm tra" },
            { id: PERMISSIONS.QUIZ_MANAGE, label: "Quản lý bài kiểm tra" },
        ]
    },
    {
        id: "discipline",
        label: "Nề nếp & Chuyên môn",
        permissions: [
            { id: PERMISSIONS.DISCIPLINE_VIEW, label: "Xem nề nếp" },
            { id: PERMISSIONS.DISCIPLINE_MANAGE, label: "Quản lý nề nếp" },
            { id: PERMISSIONS.DEPARTMENT_MANAGE, label: "Quản lý tổ bộ môn" },
            { id: PERMISSIONS.REWARD_TYPE_MANAGE, label: "Quản lý thi đua" },
        ]
    },
    {
        id: "finance",
        label: "Tài chính & Học phí",
        permissions: [
            { id: PERMISSIONS.FEES_VIEW, label: "Xem học phí" },
            { id: PERMISSIONS.FEES_MANAGE, label: "Quản lý học phí" },
        ]
    },
    {
        id: "others",
        label: "Khác",
        permissions: [
            { id: PERMISSIONS.NOTIFICATION_VIEW, label: "Xem thông báo" },
            { id: PERMISSIONS.NOTIFICATION_MANAGE, label: "Gửi thông báo" },
            { id: PERMISSIONS.ATTENDANCE_VIEW, label: "Xem điểm danh" },
            { id: PERMISSIONS.ATTENDANCE_MANAGE, label: "Quản lý điểm danh" },
            { id: PERMISSIONS.REPORT_VIEW, label: "Xem báo cáo" },
        ]
    },
    {
        id: "approvals",
        label: "Phê duyệt & Yêu cầu",
        permissions: [
            { id: PERMISSIONS.APPROVAL_REQUEST, label: "Gửi yêu cầu phê duyệt" },
            { id: PERMISSIONS.APPROVAL_PROCESS, label: "Thực hiện phê duyệt" },
        ]
    }
];

export const permissionSidebarMap = [];

