export const PERMISSIONS = {
    // 1. Người dùng
    USER_VIEW: 'users:read',
    USER_CREATE: 'users:create',
    USER_UPDATE: 'users:update',
    USER_DELETE: 'users:delete',

    // 2. Lớp học
    CLASS_VIEW: 'classes:read',
    CLASS_MANAGE: 'classes:manage',

    // 3. Phân công lớp
    CLASS_ALLOCATION_VIEW: 'class_allocation:read',
    CLASS_ALLOCATION_MANAGE: 'class_allocation:manage',

    // 4. Bài học
    LESSONS_VIEW: 'lessons:read',
    LESSONS_CREATE: 'lessons:create',
    LESSONS_UPDATE: 'lessons:update',
    LESSONS_DELETE: 'lessons:delete',

    // 5. Điểm số
    GRADE_VIEW: 'grades:read',
    GRADE_CREATE: 'grades:create',
    GRADE_FINALIZE: 'grades:finalize',
    GRADE_UNLOCK: 'grades:unlock',

    // 6. Kiểm tra
    EXAM_VIEW: 'exam:read',
    EXAM_MANAGE: 'exam:manage',
    QUIZ_VIEW: 'quiz:read',
    QUIZ_MANAGE: 'quiz:manage',

    // 7. Thời khóa biểu
    TIMETABLE_VIEW: 'timetable:read',
    TIMETABLE_MANAGE: 'timetable:manage',
    TIMETABLE_DELETE: 'timetable:delete',

    // 8. Nề nếp
    DISCIPLINE_VIEW: 'discipline:read',
    DISCIPLINE_MANAGE: 'discipline:manage',

    // 8.1. Loại vi phạm
    VIOLATION_TYPE_VIEW: 'violation_types:read',
    VIOLATION_TYPE_CREATE: 'violation_types:create',
    VIOLATION_TYPE_UPDATE: 'violation_types:update',
    VIOLATION_TYPE_DELETE: 'violation_types:delete',

    // 9. Nghỉ phép
    LEAVE_REQUESTS_VIEW: 'leave_requests:read',
    LEAVE_REQUESTS_APPROVE: 'leave_requests:approve',
    LEAVE_REQUESTS_MANAGE: 'leave_requests:manage',

    // 10. Tài chính / Học phí
    FEES_VIEW: 'fees:read',
    FEES_CREATE: 'fees:create',
    FEES_UPDATE: 'fees:update',
    FEES_DELETE: 'fees:delete',
    FEES_MANAGE: 'fees:manage',
    FINANCE_TUITION_VIEW: 'fees:read',
    FINANCE_TUITION_MANAGE: 'fees:manage',

    // 11. Công nợ
    DEBT_VIEW: 'debts:read',
    DEBT_MANAGE: 'debts:create',

    // 12. Tài khoản ngân hàng
    SCHOOL_BANK_ACCOUNT_VIEW: 'school_bank_accounts:read',
    SCHOOL_BANK_ACCOUNT_MANAGE: 'school_bank_accounts:manage',

    // 13. Thông báo thu
    FEE_NOTICE_VIEW: 'fee_notices:read',
    FEE_NOTICE_MANAGE: 'fee_notices:manage',

    // 14. Hóa đơn
    INVOICE_VIEW: 'invoices:read',
    INVOICE_MANAGE: 'invoices:update',

    // 15. Thông báo
    NOTIFICATION_VIEW: 'notifications:read',
    NOTIFICATION_MANAGE: 'notifications:manage',

    // 16. Giáo viên
    TEACHER_VIEW: 'teachers:read',
    TEACHER_MANAGE: 'teachers:manage',

    // 17. Học sinh
    STUDENT_VIEW: 'students:read',
    STUDENT_CREATE: 'students:create',
    STUDENT_UPDATE: 'students:update',
    STUDENT_DELETE: 'students:delete',

    // 18. Phụ huynh
    GUARDIAN_VIEW: 'guardians:read',
    GUARDIAN_CREATE: 'guardians:create',
    GUARDIAN_UPDATE: 'guardians:update',
    GUARDIAN_DELETE: 'guardians:delete',

    // 19. Bộ môn
    DEPARTMENT_VIEW: 'departments:read',
    DEPARTMENT_MANAGE: 'departments:manage',

    // 20. Lớp học (thêm actions)
    CLASS_CREATE: 'classes:create',
    CLASS_UPDATE: 'classes:update',
    CLASS_DELETE: 'classes:delete',
    CLASS_ASSIGN_OFFICERS: 'classes:assign_officers',
    CLASS_READ_SUMMARY: 'classes:read_summary',

    // 21. Môn học (thêm actions)
    SUBJECTS_CREATE: 'subjects:create',
    SUBJECTS_UPDATE: 'subjects:update',
    SUBJECTS_DELETE: 'subjects:delete',

    // 22. Phòng học (thêm actions)
    ROOMS_CREATE: 'rooms:create',
    ROOMS_UPDATE: 'rooms:update',
    ROOMS_DELETE: 'rooms:delete',

    // 23. Giáo viên (thêm actions)
    TEACHER_CREATE: 'teachers:create',
    TEACHER_UPDATE: 'teachers:update',
    TEACHER_DELETE: 'teachers:delete',

    // 24. Thông báo (thêm broadcast)
    NOTIFICATION_BROADCAST: 'notifications:broadcast',

    // 25. Thông báo thu (thêm actions)
    FEE_NOTICE_CREATE: 'fee_notices:create',
    FEE_NOTICE_UPDATE: 'fee_notices:update',
    FEE_NOTICE_DELETE: 'fee_notices:delete',

    // 26. Tài khoản ngân hàng (thêm actions)
    SCHOOL_BANK_ACCOUNT_CREATE: 'school_bank_accounts:create',
    SCHOOL_BANK_ACCOUNT_UPDATE: 'school_bank_accounts:update',
    SCHOOL_BANK_ACCOUNT_DELETE: 'school_bank_accounts:delete',

    // 27. Thời khóa biểu (thêm actions)
    TIMETABLE_CREATE: 'timetable:create',
    TIMETABLE_UPDATE: 'timetable:update',
    TIMETABLE_DELETE: 'timetable:delete',

    // 28. Hệ thống
    AUDIT_LOG_VIEW: 'audit_logs:read',
    PERMISSION_AUDIT_VIEW: 'audit_logs:read',
    PERMISSION_MANAGE: 'permissions:manage',
    DASHBOARD_VIEW: 'dashboard:read',
    SYSTEM_CONFIG_VIEW: 'system_config:read',
    SYSTEM_CONFIG_UPDATE: 'system_config:update',
    BACKUP_VIEW: 'backup:read',
    BACKUP_CREATE: 'backup:create',
    BACKUP_RESTORE: 'backup:restore',
    SYSTEM_LOG_VIEW: 'system_logs:read',

    // 24. Môn học & Phòng học
    SUBJECTS_VIEW: 'subjects:read',
    SUBJECTS_MANAGE: 'subjects:manage',
    ROOMS_VIEW: 'rooms:read',
    ROOMS_MANAGE: 'rooms:manage',
};

export const MANAGEMENT_TITLES = [
    { label: "Tùy chỉnh", value: "custom", permissions: [] },
    { label: "Quản trị viên", value: "admin", permissions: Object.values(PERMISSIONS) },
    { label: "Hiệu trưởng", value: "principal", permissions: Object.values(PERMISSIONS) },
    { label: "Phó hiệu trưởng (Học vụ)", value: "vp_academic", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.CLASS_VIEW, PERMISSIONS.GRADE_VIEW,
        PERMISSIONS.EXAM_VIEW, PERMISSIONS.TEACHER_VIEW, PERMISSIONS.STUDENT_VIEW
    ] },
    { label: "Phó hiệu trưởng (Nề nếp)", value: "vp_discipline", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.DISCIPLINE_VIEW, PERMISSIONS.DISCIPLINE_MANAGE,
        PERMISSIONS.VIOLATION_TYPE_VIEW, PERMISSIONS.VIOLATION_TYPE_CREATE, PERMISSIONS.VIOLATION_TYPE_UPDATE, PERMISSIONS.VIOLATION_TYPE_DELETE,
        PERMISSIONS.REWARD_TYPE_VIEW, PERMISSIONS.NOTIFICATION_VIEW,
        PERMISSIONS.LEAVE_REQUESTS_VIEW, PERMISSIONS.LEAVE_REQUESTS_APPROVE
    ] },
    { label: "Giáo vụ", value: "academic_staff", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.CLASS_VIEW, PERMISSIONS.CLASS_ALLOCATION_VIEW,
        PERMISSIONS.STUDENT_VIEW
    ] },
    { label: "Kế toán", value: "finance", permissions: [
        PERMISSIONS.USER_VIEW,
        PERMISSIONS.FEES_VIEW, PERMISSIONS.FEES_CREATE, PERMISSIONS.FEES_UPDATE, PERMISSIONS.FEES_DELETE, PERMISSIONS.FEES_MANAGE,
        PERMISSIONS.DEBT_VIEW, PERMISSIONS.DEBT_MANAGE,
        PERMISSIONS.FEE_NOTICE_VIEW, PERMISSIONS.FEE_NOTICE_MANAGE,
        PERMISSIONS.SCHOOL_BANK_ACCOUNT_VIEW, PERMISSIONS.SCHOOL_BANK_ACCOUNT_MANAGE,
        PERMISSIONS.INVOICE_VIEW, PERMISSIONS.INVOICE_MANAGE,
        PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.SUBJECTS_VIEW, PERMISSIONS.SUBJECTS_MANAGE,
        PERMISSIONS.ROOMS_VIEW, PERMISSIONS.ROOMS_MANAGE,
        PERMISSIONS.APPROVAL_REQUEST, PERMISSIONS.APPROVAL_PROCESS,
    ] },
    { label: "Tổ trưởng bộ môn", value: "dept_head", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.TEACHER_VIEW, PERMISSIONS.DEPARTMENT_MANAGE, PERMISSIONS.DASHBOARD_VIEW
    ] },
    { label: "Quản lý lịch", value: "schedule_manager", permissions: [
        PERMISSIONS.TIMETABLE_VIEW, PERMISSIONS.TIMETABLE_MANAGE,
        PERMISSIONS.SUBJECTS_VIEW, PERMISSIONS.ROOMS_VIEW,
        PERMISSIONS.TEACHER_VIEW, PERMISSIONS.CLASS_VIEW,
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
            { id: PERMISSIONS.GUARDIAN_VIEW, label: "Xem phụ huynh" },
            { id: PERMISSIONS.GUARDIAN_CREATE, label: "Thêm phụ huynh" },
            { id: PERMISSIONS.GUARDIAN_UPDATE, label: "Sửa phụ huynh" },
            { id: PERMISSIONS.GUARDIAN_DELETE, label: "Xóa phụ huynh" },
        ]
    },
    {
        id: "academic",
        label: "Đào tạo & Lớp học",
        permissions: [
            { id: PERMISSIONS.CLASS_VIEW, label: "Xem danh sách lớp" },
            { id: PERMISSIONS.CLASS_MANAGE, label: "Quản lý lớp học" },
            { id: PERMISSIONS.CLASS_CREATE, label: "Tạo lớp học" },
            { id: PERMISSIONS.CLASS_UPDATE, label: "Sửa lớp học" },
            { id: PERMISSIONS.CLASS_DELETE, label: "Xóa lớp học" },
            { id: PERMISSIONS.CLASS_ASSIGN_OFFICERS, label: "Phân công cán bộ lớp" },
            { id: PERMISSIONS.CLASS_READ_SUMMARY, label: "Xem tổng kết lớp" },
            { id: PERMISSIONS.CLASS_ALLOCATION_VIEW, label: "Xem phân công lớp" },
            { id: PERMISSIONS.CLASS_ALLOCATION_MANAGE, label: "Quản lý phân công" },
            { id: PERMISSIONS.LESSONS_VIEW, label: "Xem bài học" },
            { id: PERMISSIONS.LESSONS_CREATE, label: "Tạo bài học" },
            { id: PERMISSIONS.LESSONS_UPDATE, label: "Sửa bài học" },
            { id: PERMISSIONS.LESSONS_DELETE, label: "Xóa bài học" },
        ]
    },
    {
        id: "teachers",
        label: "Giáo viên & Bộ môn",
        permissions: [
            { id: PERMISSIONS.TEACHER_VIEW, label: "Xem giáo viên" },
            { id: PERMISSIONS.TEACHER_CREATE, label: "Thêm giáo viên" },
            { id: PERMISSIONS.TEACHER_UPDATE, label: "Sửa giáo viên" },
            { id: PERMISSIONS.TEACHER_DELETE, label: "Xóa giáo viên" },
            { id: PERMISSIONS.TEACHER_MANAGE, label: "Quản lý giáo viên" },
            { id: PERMISSIONS.DEPARTMENT_VIEW, label: "Xem tổ bộ môn" },
            { id: PERMISSIONS.DEPARTMENT_MANAGE, label: "Quản lý tổ bộ môn" },
            { id: PERMISSIONS.SUBJECTS_VIEW, label: "Xem môn học" },
            { id: PERMISSIONS.SUBJECTS_CREATE, label: "Tạo môn học" },
            { id: PERMISSIONS.SUBJECTS_UPDATE, label: "Sửa môn học" },
            { id: PERMISSIONS.SUBJECTS_DELETE, label: "Xóa môn học" },
            { id: PERMISSIONS.SUBJECTS_MANAGE, label: "Quản lý môn học" },
        ]
    },
    {
        id: "students",
        label: "Học sinh & Phòng học",
        permissions: [
            { id: PERMISSIONS.STUDENT_VIEW, label: "Xem học sinh" },
            { id: PERMISSIONS.STUDENT_CREATE, label: "Thêm học sinh" },
            { id: PERMISSIONS.STUDENT_UPDATE, label: "Sửa học sinh" },
            { id: PERMISSIONS.STUDENT_DELETE, label: "Xóa học sinh" },
            { id: PERMISSIONS.ROOMS_VIEW, label: "Xem phòng học" },
            { id: PERMISSIONS.ROOMS_CREATE, label: "Tạo phòng học" },
            { id: PERMISSIONS.ROOMS_UPDATE, label: "Sửa phòng học" },
            { id: PERMISSIONS.ROOMS_DELETE, label: "Xóa phòng học" },
            { id: PERMISSIONS.ROOMS_MANAGE, label: "Quản lý phòng học" },
        ]
    },
    {
        id: "grades",
        label: "Điểm số & Kiểm tra",
        permissions: [
            { id: PERMISSIONS.GRADE_VIEW, label: "Xem điểm số" },
            { id: PERMISSIONS.GRADE_CREATE, label: "Nhập điểm số" },
            { id: PERMISSIONS.GRADE_FINALIZE, label: "Khóa điểm" },
            { id: PERMISSIONS.GRADE_UNLOCK, label: "Mở khóa điểm" },
            { id: PERMISSIONS.EXAM_VIEW, label: "Xem kỳ thi" },
            { id: PERMISSIONS.EXAM_MANAGE, label: "Quản lý kỳ thi" },
            { id: PERMISSIONS.QUIZ_VIEW, label: "Xem bài kiểm tra" },
            { id: PERMISSIONS.QUIZ_MANAGE, label: "Quản lý bài kiểm tra" },
        ]
    },
    {
        id: "timetable",
        label: "Thời khóa biểu",
        permissions: [
            { id: PERMISSIONS.TIMETABLE_VIEW, label: "Xem thời khóa biểu" },
            { id: PERMISSIONS.TIMETABLE_CREATE, label: "Tạo thời khóa biểu" },
            { id: PERMISSIONS.TIMETABLE_UPDATE, label: "Sửa thời khóa biểu" },
            { id: PERMISSIONS.TIMETABLE_DELETE, label: "Xóa thời khóa biểu" },
            { id: PERMISSIONS.TIMETABLE_MANAGE, label: "Quản lý thời khóa biểu" },
        ]
    },
    {
        id: "discipline",
        label: "Nề nếp & Thi đua",
        permissions: [
            { id: PERMISSIONS.DISCIPLINE_VIEW, label: "Xem nề nếp" },
            { id: PERMISSIONS.DISCIPLINE_MANAGE, label: "Quản lý nề nếp" },
            { id: PERMISSIONS.VIOLATION_TYPE_VIEW, label: "Xem loại vi phạm" },
            { id: PERMISSIONS.VIOLATION_TYPE_CREATE, label: "Tạo loại vi phạm" },
            { id: PERMISSIONS.VIOLATION_TYPE_UPDATE, label: "Sửa loại vi phạm" },
            { id: PERMISSIONS.VIOLATION_TYPE_DELETE, label: "Xóa loại vi phạm" },
            { id: PERMISSIONS.REWARD_TYPE_VIEW, label: "Xem khen thưởng" },
            { id: PERMISSIONS.REWARD_TYPE_MANAGE, label: "Quản lý khen thưởng" },
            { id: PERMISSIONS.LEAVE_REQUESTS_VIEW, label: "Xem đơn nghỉ phép" },
            { id: PERMISSIONS.LEAVE_REQUESTS_APPROVE, label: "Phê duyệt đơn nghỉ phép" },
            { id: PERMISSIONS.LEAVE_REQUESTS_MANAGE, label: "Quản lý đơn nghỉ phép" },
            { id: PERMISSIONS.ATTENDANCE_VIEW, label: "Xem điểm danh" },
            { id: PERMISSIONS.ATTENDANCE_MANAGE, label: "Quản lý điểm danh" },
        ]
    },
    {
        id: "finance",
        label: "Tài chính & Học phí",
        permissions: [
            { id: PERMISSIONS.FEES_VIEW, label: "Xem học phí" },
            { id: PERMISSIONS.FEES_CREATE, label: "Tạo khoản thu" },
            { id: PERMISSIONS.FEES_UPDATE, label: "Sửa khoản thu" },
            { id: PERMISSIONS.FEES_DELETE, label: "Xóa khoản thu" },
            { id: PERMISSIONS.FEES_MANAGE, label: "Quản lý học phí" },
            { id: PERMISSIONS.DEBT_VIEW, label: "Xem công nợ" },
            { id: PERMISSIONS.DEBT_MANAGE, label: "Tạo công nợ" },
            { id: PERMISSIONS.INVOICE_VIEW, label: "Xem hóa đơn" },
            { id: PERMISSIONS.INVOICE_MANAGE, label: "Ký/gửi hóa đơn" },
            { id: PERMISSIONS.FEE_NOTICE_VIEW, label: "Xem thông báo thu" },
            { id: PERMISSIONS.FEE_NOTICE_CREATE, label: "Tạo thông báo thu" },
            { id: PERMISSIONS.FEE_NOTICE_UPDATE, label: "Sửa thông báo thu" },
            { id: PERMISSIONS.FEE_NOTICE_DELETE, label: "Xóa thông báo thu" },
            { id: PERMISSIONS.FEE_NOTICE_MANAGE, label: "Quản lý thông báo thu" },
            { id: PERMISSIONS.SCHOOL_BANK_ACCOUNT_VIEW, label: "Xem tài khoản ngân hàng" },
            { id: PERMISSIONS.SCHOOL_BANK_ACCOUNT_CREATE, label: "Tạo tài khoản ngân hàng" },
            { id: PERMISSIONS.SCHOOL_BANK_ACCOUNT_UPDATE, label: "Sửa tài khoản ngân hàng" },
            { id: PERMISSIONS.SCHOOL_BANK_ACCOUNT_DELETE, label: "Xóa tài khoản ngân hàng" },
            { id: PERMISSIONS.SCHOOL_BANK_ACCOUNT_MANAGE, label: "Quản lý tài khoản ngân hàng" },
        ]
    },
    {
        id: "notifications",
        label: "Thông báo & Báo cáo",
        permissions: [
            { id: PERMISSIONS.NOTIFICATION_VIEW, label: "Xem thông báo" },
            { id: PERMISSIONS.NOTIFICATION_BROADCAST, label: "Gửi thông báo" },
            { id: PERMISSIONS.NOTIFICATION_MANAGE, label: "Quản lý thông báo" },
            { id: PERMISSIONS.REPORT_VIEW, label: "Xem báo cáo" },
        ]
    },
    {
        id: "approvals",
        label: "Phê duyệt & Hệ thống",
        permissions: [
            { id: PERMISSIONS.APPROVAL_REQUEST, label: "Gửi yêu cầu phê duyệt" },
            { id: PERMISSIONS.APPROVAL_PROCESS, label: "Thực hiện phê duyệt" },
            { id: PERMISSIONS.PERMISSION_MANAGE, label: "Quản lý phân quyền" },
            { id: PERMISSIONS.AUDIT_LOG_VIEW, label: "Xem nhật ký hệ thống" },
            { id: PERMISSIONS.DASHBOARD_VIEW, label: "Xem Dashboard" },
            { id: PERMISSIONS.SYSTEM_CONFIG_VIEW, label: "Xem cấu hình hệ thống" },
            { id: PERMISSIONS.SYSTEM_CONFIG_UPDATE, label: "Sửa cấu hình hệ thống" },
            { id: PERMISSIONS.BACKUP_VIEW, label: "Xem backup" },
            { id: PERMISSIONS.BACKUP_CREATE, label: "Tạo backup" },
            { id: PERMISSIONS.BACKUP_RESTORE, label: "Khôi phục backup" },
            { id: PERMISSIONS.SYSTEM_LOG_VIEW, label: "Xem nhật ký hệ thống" },
        ]
    }
];

export const permissionSidebarMap = [];
