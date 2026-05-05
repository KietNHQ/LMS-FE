import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiDownload, FiUpload, FiChevronDown, FiCheck, FiShield, FiCheckSquare } from "react-icons/fi";
import { PERMISSIONS } from "../../../../../config/permissions";
import Select from "../../../../ui/Select/Select";
import { useCheckPermission } from "../../../../../hooks/useAuth";
import { classesService } from "../../../../../services/pages/admin/classes/classesService";
import "./CreateUserDialog.css";

const allRoleOptions = ["Quản lý", "Phụ huynh", "Học sinh", "Giáo viên"];

const MANAGEMENT_TITLES = [
    { label: "Tùy chỉnh", value: "custom", permissions: [] },
    { label: "Hiệu trưởng", value: "principal", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE, 
        PERMISSIONS.USER_LOCK, PERMISSIONS.USER_DELETE,
        PERMISSIONS.NOTIFICATION_VIEW, PERMISSIONS.NOTIFICATION_CREATE,
        PERMISSIONS.CLASS_VIEW, PERMISSIONS.CLASS_CREATE, PERMISSIONS.TIMETABLE_VIEW,
        PERMISSIONS.GRADE_VIEW, PERMISSIONS.GRADE_APPROVE, PERMISSIONS.REPORT_ACADEMIC_VIEW,
        PERMISSIONS.QUIZ_VIEW, PERMISSIONS.EXAM_SESSION_MANAGE, PERMISSIONS.EXAM_PROCTOR_MANAGE,
        PERMISSIONS.DISCIPLINE_VIEW, PERMISSIONS.DISCIPLINE_PROCESS, PERMISSIONS.COMPETITION_MANAGE, PERMISSIONS.REPORT_DISCIPLINE_VIEW,
        PERMISSIONS.FINANCE_TUITION_VIEW, PERMISSIONS.FINANCE_TUITION_PUBLISH, PERMISSIONS.REPORT_FINANCE_VIEW
    ] },
    { label: "Phó hiệu trưởng (Học vụ)", value: "vp_academic", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.NOTIFICATION_VIEW,
        PERMISSIONS.CLASS_VIEW, PERMISSIONS.GRADE_VIEW, PERMISSIONS.GRADE_APPROVE,
        PERMISSIONS.QUIZ_VIEW, PERMISSIONS.TIMETABLE_VIEW, PERMISSIONS.REPORT_ACADEMIC_VIEW,
        PERMISSIONS.EXAM_SESSION_MANAGE
    ] },
    { label: "Phó hiệu trưởng (Nề nếp)", value: "vp_discipline", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.NOTIFICATION_VIEW, PERMISSIONS.NOTIFICATION_CREATE,
        PERMISSIONS.DISCIPLINE_VIEW, PERMISSIONS.DISCIPLINE_PROCESS, 
        PERMISSIONS.COMPETITION_MANAGE, PERMISSIONS.REPORT_DISCIPLINE_VIEW
    ] },
    { label: "Giáo vụ", value: "academic_staff", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.CLASS_VIEW, PERMISSIONS.TIMETABLE_VIEW, 
        PERMISSIONS.QUIZ_VIEW, PERMISSIONS.EXAM_SESSION_MANAGE, PERMISSIONS.EXAM_PROCTOR_MANAGE
    ] },
    { label: "Kế toán", value: "finance", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.FINANCE_TUITION_VIEW, 
        PERMISSIONS.FINANCE_TUITION_PUBLISH, PERMISSIONS.REPORT_FINANCE_VIEW
    ] },
    { label: "Tổ trưởng bộ môn", value: "dept_head", permissions: [
        PERMISSIONS.USER_VIEW, PERMISSIONS.CLASS_VIEW, 
        PERMISSIONS.QUIZ_VIEW, PERMISSIONS.NOTIFICATION_VIEW
    ] },
];

const SUBJECT_OPTIONS = [
    "Toán học", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", 
    "Địa lý", "Tin học", "GDCD", "Thể dục", "Công nghệ", "Mỹ thuật", "Âm nhạc", "GDQP-AN", "Khác"
];

const PERMISSION_GROUPS = [
    {
        id: "users",
        label: "Người dùng & Thông báo",
        permissions: [
            { id: PERMISSIONS.USER_VIEW, label: "Xem người dùng" },
            { id: PERMISSIONS.USER_CREATE, label: "Thêm người dùng" },
            { id: PERMISSIONS.USER_UPDATE, label: "Sửa người dùng" },
            { id: PERMISSIONS.USER_LOCK, label: "Ẩn (Vô hiệu hóa)" },
            { id: PERMISSIONS.USER_DELETE, label: "Xóa vĩnh viễn" },
            { id: PERMISSIONS.NOTIFICATION_VIEW, label: "Xem thông báo toàn trường" },
            { id: PERMISSIONS.NOTIFICATION_CREATE, label: "Gửi thông báo toàn trường" },
        ]
    },
    {
        id: "classes",
        label: "Đào tạo & Lớp học",
        permissions: [
            { id: PERMISSIONS.CLASS_VIEW, label: "Quản lý danh sách lớp" },
            { id: PERMISSIONS.CLASS_CREATE, label: "Tạo lớp học mới" },
            { id: PERMISSIONS.TIMETABLE_VIEW, label: "Quản lý thời khóa biểu" },
            { id: PERMISSIONS.TIMETABLE_RESOLVE_CONFLICT, label: "Xử lý xung đột TKB" },
        ]
    },
    {
        id: "grades",
        label: "Học tập & Điểm số",
        permissions: [
            { id: PERMISSIONS.GRADE_VIEW, label: "Xem điểm số toàn trường" },
            { id: PERMISSIONS.GRADE_APPROVE, label: "Phê duyệt điểm số" },
        ]
    },
    {
        id: "exams",
        label: "Kỳ thi & Kiểm tra",
        permissions: [
            { id: PERMISSIONS.QUIZ_VIEW, label: "Quản lý ngân hàng đề thi/quiz" },
            { id: PERMISSIONS.EXAM_SESSION_MANAGE, label: "Quản lý ca thi/phòng thi" },
            { id: PERMISSIONS.EXAM_PROCTOR_MANAGE, label: "Phân công giám thị" },
        ]
    },
    {
        id: "discipline",
        label: "Nề nếp & Thi đua",
        permissions: [
            { id: PERMISSIONS.DISCIPLINE_VIEW, label: "Quản lý vi phạm nề nếp" },
            { id: PERMISSIONS.DISCIPLINE_PROCESS, label: "Xử lý/Duyệt kỷ luật" },
            { id: PERMISSIONS.COMPETITION_MANAGE, label: "Quản lý thi đua khối/lớp" },
        ]
    },
    {
        id: "finance",
        label: "Tài chính & Học phí",
        permissions: [
            { id: PERMISSIONS.FINANCE_TUITION_VIEW, label: "Quản lý học phí & khoản thu" },
            { id: PERMISSIONS.FINANCE_TUITION_PUBLISH, label: "Công khai phiếu thu" },
        ]
    },
    {
        id: "reports",
        label: "Hệ thống Báo cáo",
        permissions: [
            { id: PERMISSIONS.REPORT_ACADEMIC_VIEW, label: "Báo cáo Học lực & Hạnh kiểm" },
            { id: PERMISSIONS.REPORT_DISCIPLINE_VIEW, label: "Báo cáo Kỷ luật & Thi đua" },
            { id: PERMISSIONS.REPORT_FINANCE_VIEW, label: "Báo cáo Doanh thu & Công nợ" },
        ]
    }
];

const roleEmailDomainMap = {
    "Quản trị viên": "thptlocal.edu.vn",
    "Quản lý": "thptlocal.edu.vn",
    "Giáo viên": "thptlocal.edu.vn",
    "Học sinh": "thptlocal.edu.vn",
    "Phụ huynh": "thptlocal.edu.vn",
};

function getRoleEmailDomain(role) { return roleEmailDomainMap[role] || roleEmailDomainMap["Học sinh"]; }

function removeVietnameseMarks(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function toToken(value) {
    return removeVietnameseMarks(value).toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "");
}

function toInitials(value) {
    return removeVietnameseMarks(value).toLowerCase().trim().split(/\s+/).filter(Boolean).map((word) => word.charAt(0)).join("").replace(/[^a-z0-9]/g, "");
}

function parseFullName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { lastName: "", firstName: "" };
    if (parts.length === 1) return { lastName: "", firstName: parts[0] };
    return { lastName: parts.slice(0, -1).join(" "), firstName: parts[parts.length - 1] };
}

function normalizePhone(value) { return String(value || "").replace(/\D/g, "").slice(0, 10); }

function buildEmail(firstName, lastName, role) {
    const first = toToken(firstName);
    const initials = toInitials(lastName);
    const localPart = [first, initials].filter(Boolean).join(".") || "user";
    return `${localPart}@${getRoleEmailDomain(role)}`;
}

function createEmptyChild() { return { childName: "", childClass: "" }; }

function buildDefaultForm(role) {
    return {
        lastName: "", firstName: "", dob: "", role: role || "Học sinh",
        studentInfo: { parentName: "", parentPhone: "", hasPersonalPhone: false, personalPhone: "" },
        teacherInfo: { subject: "", phone: "", isHomeroomTeacher: false, homeroomClass: "" },
        parentInfo: { children: [createEmptyChild()], phone: "" },
        managerInfo: { title: "custom", customTitle: "", permissions: [] },
        status: "Hoạt động",
    };
}

function buildFormFromInitialData(initialData, mode, role) {
    if (!initialData) return buildDefaultForm(role);
    const profile = initialData.profile || {};
    const parsed = parseFullName(initialData.name);
    let rawDob = profile.dob || initialData.dob || "";
    if (rawDob && rawDob.includes("T")) rawDob = rawDob.split("T")[0];
    if (rawDob && rawDob.includes("/") && rawDob.split("/")[0].length === 2) {
        const parts = rawDob.split("/");
        rawDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const initialChildren = Array.isArray(profile.children || initialData.displayChildren)
        ? (profile.children || initialData.displayChildren).map(child => ({
            childName: String(child?.childName || child?.studentName || "").trim(),
            childClass: String(child?.childClass || child?.className || child?.class || "").trim(),
        })).filter(child => child.childName || child.childClass) : [];
    const resolvedChildren = initialChildren.length > 0 ? initialChildren : [createEmptyChild()];
    return {
        lastName: profile.lastName || parsed.lastName || "",
        firstName: profile.firstName || parsed.firstName || "",
        dob: rawDob,
        role: role || initialData.role,
        studentInfo: { parentName: profile.parentName || "", parentPhone: normalizePhone(profile.parentPhone || ""), hasPersonalPhone: Boolean(profile.hasPersonalPhone), personalPhone: normalizePhone(profile.personalPhone || initialData.phone || "") },
        teacherInfo: { subject: profile.subject || "", phone: normalizePhone(profile.phone || initialData.phone || ""), isHomeroomTeacher: !!profile.homeroomClass, homeroomClass: profile.homeroomClass || "" },
        parentInfo: { children: resolvedChildren, phone: normalizePhone(profile.phone || initialData.phone || "") },
        managerInfo: { title: profile.title || "custom", customTitle: profile.customTitle || "", permissions: Array.isArray(profile.permissions) ? profile.permissions : [] },
        status: initialData.status || "Hoạt động",
    };
}

function buildRoleProfile(role, form) {
    if (role === "Học sinh") return { parentName: form.studentInfo.parentName.trim(), parentPhone: form.studentInfo.parentPhone, hasPersonalPhone: form.studentInfo.hasPersonalPhone, personalPhone: form.studentInfo.hasPersonalPhone ? form.studentInfo.personalPhone : "" };
    if (role === "Giáo viên") return { subject: form.teacherInfo.subject.trim(), phone: form.teacherInfo.phone, homeroomClass: form.teacherInfo.isHomeroomTeacher ? form.teacherInfo.homeroomClass : "" };
    if (role === "Phụ huynh") {
        const children = form.parentInfo.children.map(child => ({ childName: String(child.childName || "").trim(), childClass: String(child.childClass || "").trim() })).filter(child => child.childName && child.childClass);
        return { childName: children[0]?.childName || "", childClass: children[0]?.childClass || "", children, phone: form.parentInfo.phone };
    }
    if (role === "Quản lý") {
        const titleData = MANAGEMENT_TITLES.find(t => t.value === form.managerInfo.title);
        const resolvedTitle = form.managerInfo.title === "custom" ? form.managerInfo.customTitle.trim() : (titleData?.label || form.managerInfo.title);
        return { title: resolvedTitle, titleKey: form.managerInfo.title, permissions: form.managerInfo.permissions };
    }
    return {};
}

function getRolePhone(role, form) {
    if (role === "Học sinh") return form.studentInfo.hasPersonalPhone ? form.studentInfo.personalPhone : "—";
    if (role === "Giáo viên") return form.teacherInfo.phone || "—";
    if (role === "Phụ huynh") return form.parentInfo.phone || "—";
    return "—";
}

export default function CreateUserDialog({ mode = "create", title, submitLabel, initialData, fixedRole, onClose, onSubmit, onImportExcel, onDownloadTemplate, isImportingExcel = false, importFeedback }) {
    const { user: currentUser } = useCheckPermission();
    const isAdmin = currentUser?.role === "admin";
    const normalizedRoleOptions = useMemo(() => (mode === "edit" && initialData?.role === "Quản trị viên") ? ["Quản trị viên", ...allRoleOptions] : allRoleOptions, [mode, initialData]);
    const [form, setForm] = useState(() => buildFormFromInitialData(initialData, mode, fixedRole || initialData?.role || normalizedRoleOptions[0] || "Học sinh"));
    const [expandedGroups, setExpandedGroups] = useState(["users"]);
    const [realClasses, setRealClasses] = useState([]);
    const contentRef = useRef(null);

    // Fetch danh sách lớp học thật
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classesService.listClasses();
                const classNames = data.map(c => c.name).sort();
                setRealClasses(classNames);
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            }
        };
        fetchClasses();
    }, []);

    // Cuộn lên đầu khi mở hộp thoại hoặc đổi mode/dữ liệu
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [mode, initialData]);
    const selectedRole = fixedRole || form.role;
    const generatedEmail = useMemo(() => buildEmail(form.firstName, form.lastName, selectedRole), [form.firstName, form.lastName, selectedRole]);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const handleRoleInfoChange = (section, field, value) => setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: field.toLowerCase().includes("phone") ? normalizePhone(value) : value } }));
    const handleParentChildChange = (index, field, value) => setForm(prev => ({ ...prev, parentInfo: { ...prev.parentInfo, children: prev.parentInfo.children.map((c, i) => i === index ? { ...c, [field]: value } : c) } }));
    const handleAddParentChild = () => setForm(prev => ({ ...prev, parentInfo: { ...prev.parentInfo, children: [...prev.parentInfo.children, createEmptyChild()] } }));
    const handleRemoveParentChild = (index) => setForm(prev => prev.parentInfo.children.length <= 1 ? prev : ({ ...prev, parentInfo: { children: prev.parentInfo.children.filter((_, i) => i !== index) } }));
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.lastName.trim() || !form.firstName.trim() || !form.dob) { window.alert("Vui lòng điền đủ thông tin."); return; }
        onSubmit({
            name: `${form.lastName} ${form.firstName}`.trim(),
            lastName: form.lastName.trim(),
            firstName: form.firstName.trim(),
            dob: form.dob,
            email: generatedEmail,
            role: selectedRole,
            phone: getRolePhone(selectedRole, form),
            status: form.status,
            profile: { ...buildRoleProfile(selectedRole, form), lastName: form.lastName.trim(), firstName: form.firstName.trim(), dob: form.dob }
        });
    };

    return (
        <div className="admin-create-user-dialog-overlay" onClick={onClose}>
            <div className="admin-create-user-dialog-modal" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                {mode === "create" && onImportExcel && (
                    <div className="admin-create-user-dialog-excel-actions">
                        <button type="button" className="admin-create-user-dialog-excel-btn" onClick={onDownloadTemplate}><FiDownload /> <span>Tải mẫu</span></button>
                        <label className="admin-create-user-dialog-excel-btn"><FiUpload /> <span>{isImportingExcel ? "Đang nạp..." : "Thêm bằng Excel"}</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e => { const f = e.target.files?.[0]; if (f) onImportExcel(f); e.target.value = ""; }} disabled={isImportingExcel} /></label>
                    </div>
                )}
                {importFeedback && <div className={`admin-create-user-dialog-import-feedback ${importFeedback.type}`}>{importFeedback.message}</div>}

                <form className="admin-create-user-dialog-form" onSubmit={handleSubmit}>
                    <div className="admin-create-user-dialog-form-content" ref={contentRef}>
                        {mode === "edit" ? (
                            <>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="edit-lastname">Họ và tên lót</label>
                                        <input 
                                            id="edit-lastname"
                                            type="text" 
                                            value={form.lastName} 
                                            onChange={e => handleChange("lastName", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="edit-firstname">Tên</label>
                                        <input 
                                            id="edit-firstname"
                                            type="text" 
                                            value={form.firstName} 
                                            onChange={e => handleChange("firstName", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="edit-dob">Ngày sinh</label>
                                        <input 
                                            id="edit-dob"
                                            type="date" 
                                            value={form.dob} 
                                            onChange={e => handleChange("dob", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label>Email hệ thống</label>
                                        <div className="admin-create-user-dialog-readonly-value">
                                            {generatedEmail}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="create-lastname">Họ và tên lót</label>
                                        <input 
                                            id="create-lastname"
                                            type="text" 
                                            placeholder="VD: Nguyễn Văn"
                                            value={form.lastName} 
                                            onChange={e => handleChange("lastName", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="create-firstname">Tên</label>
                                        <input 
                                            id="create-firstname"
                                            type="text" 
                                            placeholder="VD: Tuấn"
                                            value={form.firstName} 
                                            onChange={e => handleChange("firstName", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="create-dob">Ngày tháng năm sinh</label>
                                        <input 
                                            id="create-dob"
                                            type="date" 
                                            value={form.dob} 
                                            onChange={e => handleChange("dob", e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label>Vai trò</label>
                                        {fixedRole ? (
                                            <div className="admin-create-user-dialog-readonly-value">{fixedRole}</div>
                                        ) : (
                                            <Select 
                                                variant="custom" 
                                                value={form.role} 
                                                onChange={e => handleChange("role", e.target.value)} 
                                                options={normalizedRoleOptions} 
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="admin-create-user-dialog-field">
                                    <label>Email hệ thống (Tự động)</label>
                                    <div className="admin-create-user-dialog-readonly-value">
                                        {generatedEmail}
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedRole === "Giáo viên" && (
                            <div className="admin-create-user-dialog-role-block">
                                <h3>Thông tin giáo viên</h3>
                                <div className="admin-create-user-dialog-field-row">
                                    <div className="admin-create-user-dialog-field">
                                        <label>Môn chuyên dạy</label>
                                        <Select 
                                            variant="custom" 
                                            value={form.teacherInfo.subject} 
                                            onChange={e => handleRoleInfoChange("teacherInfo", "subject", e.target.value)} 
                                            options={SUBJECT_OPTIONS} 
                                            placeholder="Chọn môn" 
                                        />
                                    </div>
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="teacher-phone">Số điện thoại</label>
                                        <input 
                                            id="teacher-phone"
                                            type="tel" 
                                            value={form.teacherInfo.phone} 
                                            onChange={e => handleRoleInfoChange("teacherInfo", "phone", e.target.value)} 
                                            inputMode="numeric" 
                                            maxLength={10} 
                                            required 
                                        />
                                    </div>
                                </div>
                                {mode === "edit" && (
                                    <div className="admin-create-user-dialog-field-row">
                                        <div className="admin-create-user-dialog-field">
                                            <label>Lớp chủ nhiệm</label>
                                            <Select 
                                                variant="custom" 
                                                value={form.teacherInfo.isHomeroomTeacher ? form.teacherInfo.homeroomClass : "Chưa phân công"} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    handleRoleInfoChange("teacherInfo", "isHomeroomTeacher", val !== "Chưa phân công");
                                                    handleRoleInfoChange("teacherInfo", "homeroomClass", val === "Chưa phân công" ? "" : val);
                                                }} 
                                                options={["Chưa phân công", ...realClasses]} 
                                                placeholder="Chọn lớp" 
                                            />
                                        </div>
                                        <div className="admin-create-user-dialog-field">
                                            <label>Trạng thái</label>
                                            <Select 
                                                variant="custom" 
                                                value={form.status} 
                                                onChange={e => handleChange("status", e.target.value)} 
                                                options={["Hoạt động", "Vô hiệu hóa"]} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedRole === "Học sinh" && (
                            <div className="admin-create-user-dialog-role-block">
                                <h3>Thông tin học sinh</h3>
                                <div className="admin-create-user-dialog-field">
                                    <label htmlFor="student-parent-name">Tên phụ huynh</label>
                                    <input id="student-parent-name" type="text" value={form.studentInfo.parentName} onChange={e => handleRoleInfoChange("studentInfo", "parentName", e.target.value)} required />
                                </div>
                                <div className="admin-create-user-dialog-field">
                                    <label htmlFor="student-parent-phone">SĐT phụ huynh</label>
                                    <input id="student-parent-phone" type="tel" value={form.studentInfo.parentPhone} onChange={e => handleRoleInfoChange("studentInfo", "parentPhone", e.target.value)} inputMode="numeric" maxLength={10} required />
                                </div>
                                <label className="admin-create-user-dialog-checkbox">
                                    <input type="checkbox" checked={form.studentInfo.hasPersonalPhone} onChange={e => handleRoleInfoChange("studentInfo", "hasPersonalPhone", e.target.checked)} />
                                    <span>Học sinh có SĐT cá nhân</span>
                                </label>
                                {form.studentInfo.hasPersonalPhone && (
                                    <div className="admin-create-user-dialog-field">
                                        <label htmlFor="student-personal-phone">SĐT học sinh</label>
                                        <input id="student-personal-phone" type="tel" value={form.studentInfo.personalPhone} onChange={e => handleRoleInfoChange("studentInfo", "personalPhone", e.target.value)} inputMode="numeric" maxLength={10} required />
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedRole === "Phụ huynh" && (
                            <div className="admin-create-user-dialog-role-block">
                                <div className="admin-create-user-dialog-role-header">
                                    <h3>Thông tin phụ huynh</h3>
                                    <button type="button" className="admin-create-user-dialog-child-add-btn" onClick={handleAddParentChild}>+</button>
                                </div>
                                {form.parentInfo.children.map((c, i) => (
                                    <div key={i} className="admin-create-user-dialog-child-row">
                                        <div className="admin-create-user-dialog-field-row">
                                            <div className="admin-create-user-dialog-field">
                                                <label htmlFor={`parent-child-name-${i}`}>Tên con</label>
                                                <input id={`parent-child-name-${i}`} type="text" value={c.childName} onChange={e => handleParentChildChange(i, "childName", e.target.value)} required />
                                            </div>
                                            <div className="admin-create-user-dialog-field">
                                                <label htmlFor={`parent-child-class-${i}`}>Lớp</label>
                                                <input id={`parent-child-class-${i}`} type="text" value={c.childClass} onChange={e => handleParentChildChange(i, "childClass", e.target.value)} required />
                                            </div>
                                        </div>
                                        {form.parentInfo.children.length > 1 && (
                                            <button type="button" className="admin-create-user-dialog-child-remove-btn" onClick={() => handleRemoveParentChild(i)}>Xóa</button>
                                        )}
                                    </div>
                                ))}
                                <div className="admin-create-user-dialog-field">
                                    <label htmlFor="parent-phone">Số điện thoại</label>
                                    <input id="parent-phone" type="tel" value={form.parentInfo.phone} onChange={e => handleRoleInfoChange("parentInfo", "phone", e.target.value)} inputMode="numeric" maxLength={10} required />
                                </div>
                            </div>
                        )}
                        {selectedRole === "Quản lý" && (
                            <div className="admin-create-user-dialog-role-block">
                                <h3>Phân quyền quản lý</h3>
                                <div className="admin-create-user-dialog-field"><label>Chức vụ</label><Select variant="custom" value={form.managerInfo.title} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, managerInfo: { ...p.managerInfo, title: v, permissions: MANAGEMENT_TITLES.find(t => t.value === v)?.permissions || [] } })); }} options={MANAGEMENT_TITLES} /></div>
                                {form.managerInfo.title === "custom" && <div className="admin-create-user-dialog-field"><label>Tên chức vụ</label><input type="text" value={form.managerInfo.customTitle} onChange={e => handleRoleInfoChange("managerInfo", "customTitle", e.target.value)} required /></div>}
                                <div className="admin-create-user-dialog-perm-groups">
                                    {PERMISSION_GROUPS.map(g => (
                                        <div key={g.id} className={`perm-group-item ${expandedGroups.includes(g.id) ? "active" : ""}`}>
                                            <div className="perm-group-header" onClick={() => setExpandedGroups(p => p.includes(g.id) ? p.filter(id => id !== g.id) : [...p, g.id])}>
                                                <div className="perm-group-left"><input type="checkbox" checked={g.permissions.every(p => form.managerInfo.permissions.includes(p.id))} onChange={e => { const checked = e.target.checked; const ids = g.permissions.map(p => p.id).filter(id => isAdmin || id !== PERMISSIONS.USER_DELETE); setForm(p => ({ ...p, managerInfo: { ...p.managerInfo, title: "custom", permissions: checked ? Array.from(new Set([...p.managerInfo.permissions, ...ids])) : p.managerInfo.permissions.filter(id => !ids.includes(id)) } })); }} onClick={e => e.stopPropagation()} /><span className="perm-group-label">{g.label}</span></div>
                                                <FiChevronDown className={`perm-group-arrow ${expandedGroups.includes(g.id) ? "up" : ""}`} />
                                            </div>
                                            {expandedGroups.includes(g.id) && <div className="perm-group-content">{g.permissions.map(p => <label key={p.id} className="admin-create-user-dialog-checkbox"><input type="checkbox" checked={form.managerInfo.permissions.includes(p.id)} onChange={() => setForm(pPrev => ({ ...pPrev, managerInfo: { ...pPrev.managerInfo, title: "custom", permissions: pPrev.managerInfo.permissions.includes(p.id) ? pPrev.managerInfo.permissions.filter(id => id !== p.id) : [...pPrev.managerInfo.permissions, p.id] } }))} /><span>{p.label}</span></label>)}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="admin-create-user-dialog-actions">
                        <button type="button" className="admin-create-user-dialog-btn cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="admin-create-user-dialog-btn primary">{submitLabel}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
