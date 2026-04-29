import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiDownload, FiUpload, FiChevronDown, FiCheck, FiShield, FiCheckSquare } from "react-icons/fi";
import { PERMISSIONS } from "../../../../../config/permissions";
import Select from "../../../../ui/Select/Select";
import { useCheckPermission } from "../../../../../hooks/useAuth";
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

// Flat list for easy lookup
const AVAILABLE_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions);

const roleEmailDomainMap = {
    "Quản trị viên": "thptlocal.edu.vn",
    "Quản lý": "thptlocal.edu.vn",
    "Giáo viên": "thptlocal.edu.vn",
    "Học sinh": "thptlocal.edu.vn",
    "Phụ huynh": "thptlocal.edu.vn",
};

function getRoleEmailDomain(role) {
    return roleEmailDomainMap[role] || roleEmailDomainMap["Học sinh"];
}

function removeVietnameseMarks(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

function toToken(value) {
    return removeVietnameseMarks(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "");
}

function toInitials(value) {
    return removeVietnameseMarks(value)
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .replace(/[^a-z0-9]/g, "");
}

function parseFullName(fullName) {
    const parts = String(fullName || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return {
            lastName: "",
            firstName: "",
        };
    }

    if (parts.length === 1) {
        return {
            lastName: "",
            firstName: parts[0],
        };
    }

    return {
        lastName: parts.slice(0, -1).join(" "),
        firstName: parts[parts.length - 1],
    };
}

function normalizePhone(value) {
    return String(value || "")
        .replace(/\D/g, "")
        .slice(0, 10);
}

function buildEmail(firstName, lastName, role) {
    const first = toToken(firstName);
    const initials = toInitials(lastName);
    const localPart = [first, initials].filter(Boolean).join(".") || "user";
    return `${localPart}@${getRoleEmailDomain(role)}`;
}

function createEmptyChild() {
    return {
        childName: "",
        childClass: "",
    };
}

function buildDefaultForm(role) {
    return {
        lastName: "",
        firstName: "",
        dob: "",
        role: role || "Học sinh",

        studentInfo: {
            parentName: "",
            parentPhone: "",
            hasPersonalPhone: false,
            personalPhone: "",
        },
        teacherInfo: {
            subject: "",
            phone: "",
        },
        parentInfo: {
            children: [createEmptyChild()],
            phone: "",
        },
        managerInfo: {
            title: "custom",
            permissions: [],
        },
    };
}

function buildFormFromInitialData(initialData, mode, role) {
    if (!initialData) {
        return buildDefaultForm(role);
    }

    const profile = initialData.profile || {};
    const parsed = parseFullName(initialData.name);

    // Pick DOB from profile or root, ensuring it's in YYYY-MM-DD format for date input
    let rawDob = profile.dob || initialData.dob || "";
    if (rawDob && rawDob.includes("T")) rawDob = rawDob.split("T")[0];
    // If it's DD/MM/YYYY, convert to YYYY-MM-DD
    if (rawDob && rawDob.includes("/") && rawDob.split("/")[0].length === 2) {
        const parts = rawDob.split("/");
        rawDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const initialChildren = Array.isArray(profile.children || initialData.displayChildren)
        ? (profile.children || initialData.displayChildren)
            .map((child) => ({
                childName: String(child?.childName || child?.studentName || "").trim(),
                childClass: String(child?.childClass || child?.className || child?.class || "").trim(),
            }))
            .filter((child) => child.childName || child.childClass)
        : [];

    const fallbackChild = {
        childName: String(profile.childName || profile.studentName || initialData.childName || initialData.studentName || "").trim(),
        childClass: String(profile.childClass || profile.className || profile.class || initialData.childClass || initialData.className || initialData.class || "").trim(),
    };

    const resolvedChildren =
        initialChildren.length > 0
            ? initialChildren
            : fallbackChild.childName || fallbackChild.childClass
                ? [fallbackChild]
                : [createEmptyChild()];

    return {
        lastName: profile.lastName || parsed.lastName,
        firstName: profile.firstName || parsed.firstName,
        dob: rawDob,
        role,

        studentInfo: {
            parentName: profile.parentName || "",
            parentPhone: normalizePhone(profile.parentPhone || ""),
            hasPersonalPhone: Boolean(profile.hasPersonalPhone),
            personalPhone: normalizePhone(profile.personalPhone || initialData.phone || ""),
        },
        teacherInfo: {
            subject: profile.subject || "",
            phone: normalizePhone(profile.phone || initialData.phone || ""),
        },
        parentInfo: {
            children: resolvedChildren,
            phone: normalizePhone(profile.phone || initialData.phone || ""),
        },
        managerInfo: {
            title: profile.title || "custom",
            permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
        },
        _mode: mode,
    };
}

function buildRoleProfile(role, form) {
    if (role === "Học sinh") {
        return {
            parentName: form.studentInfo.parentName.trim(),
            parentPhone: form.studentInfo.parentPhone,
            hasPersonalPhone: form.studentInfo.hasPersonalPhone,
            personalPhone: form.studentInfo.hasPersonalPhone
                ? form.studentInfo.personalPhone
                : "",
        };
    }

    if (role === "Giáo viên") {
        return {
            subject: form.teacherInfo.subject.trim(),
            phone: form.teacherInfo.phone,
        };
    }

    if (role === "Phụ huynh") {
        const children = form.parentInfo.children
            .map((child) => ({
                childName: String(child.childName || "").trim(),
                childClass: String(child.childClass || "").trim(),
            }))
            .filter((child) => child.childName && child.childClass);

        return {
            childName: children[0]?.childName || "",
            childClass: children[0]?.childClass || "",
            children,
            phone: form.parentInfo.phone,
        };
    }

    if (role === "Quản lý") {
        return {
            title: form.managerInfo.title,
            permissions: form.managerInfo.permissions,
        };
    }

    return {};
}

function getRolePhone(role, form) {
    if (role === "Học sinh") {
        return form.studentInfo.hasPersonalPhone ? form.studentInfo.personalPhone : "—";
    }

    if (role === "Giáo viên") {
        return form.teacherInfo.phone || "—";
    }

    if (role === "Phụ huynh") {
        return form.parentInfo.phone || "—";
    }

    return "—";
}

export default function CreateUserDialog({
    mode = "create",
    title,
    submitLabel,
    initialData,
    fixedRole,
    roleOptions = allRoleOptions,
    onClose,
    onSubmit,
    onImportExcel,
    onDownloadTemplate,
    isImportingExcel = false,
    importFeedback,
}) {
    const { user: currentUser } = useCheckPermission();
    const isAdmin = currentUser?.role === "admin";

    const normalizedRoleOptions = useMemo(() => {
        if (mode === "edit" && initialData?.role === "Quản trị viên") {
            return ["Quản trị viên", ...allRoleOptions];
        }
        return allRoleOptions;
    }, [mode, initialData]);

    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const roleRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleRef.current && !roleRef.current.contains(event.target)) {
                setIsRoleOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [form, setForm] = useState(() => {
        const role = fixedRole || initialData?.role || normalizedRoleOptions[0] || "Học sinh";
        return buildFormFromInitialData(initialData, mode, role);
    });

    const [expandedGroups, setExpandedGroups] = useState(["users"]);

    const toggleGroupExpand = (groupId) => {
        setExpandedGroups(prev => 
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const toggleGroupAll = (groupId, checked) => {
        const group = PERMISSION_GROUPS.find(g => g.id === groupId);
        if (!group) return;

        let groupIds = group.permissions.map(p => p.id);
        
        // Prevent non-admin from mass-assigning dangerous permissions
        if (!isAdmin) {
            groupIds = groupIds.filter(id => id !== PERMISSIONS.USER_DELETE);
        }
        
        setForm(prev => {
            const current = prev.managerInfo.permissions;
            let next;
            if (checked) {
                // Add missing ones
                next = Array.from(new Set([...current, ...groupIds]));
            } else {
                // Remove all from this group
                next = current.filter(id => !groupIds.includes(id));
            }

            return {
                ...prev,
                managerInfo: { ...prev.managerInfo, title: "custom", permissions: next }
            };
        });
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRoleInfoChange = (section, field, value) => {
        const normalizedValue = field.toLowerCase().includes("phone")
            ? normalizePhone(value)
            : value;

        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: normalizedValue,
            },
        }));
    };

    const handleParentChildChange = (index, field, value) => {
        setForm((prev) => ({
            ...prev,
            parentInfo: {
                ...prev.parentInfo,
                children: prev.parentInfo.children.map((child, childIndex) =>
                    childIndex === index
                        ? {
                            ...child,
                            [field]: value,
                        }
                        : child
                ),
            },
        }));
    };

    const handleAddParentChild = () => {
        setForm((prev) => ({
            ...prev,
            parentInfo: {
                ...prev.parentInfo,
                children: [...prev.parentInfo.children, createEmptyChild()],
            },
        }));
    };

    const handleRemoveParentChild = (index) => {
        setForm((prev) => {
            if (prev.parentInfo.children.length <= 1) {
                return prev;
            }

            return {
                ...prev,
                parentInfo: {
                    ...prev.parentInfo,
                    children: prev.parentInfo.children.filter((_, childIndex) => childIndex !== index),
                },
            };
        });
    };

    const selectedRole = fixedRole || form.role;
    const generatedEmail = useMemo(
        () => buildEmail(form.firstName, form.lastName, selectedRole),
        [form.firstName, form.lastName, selectedRole]
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.lastName.trim() || !form.firstName.trim()) {
            window.alert("Vui lòng nhập đầy đủ họ và tên.");
            return;
        }

        if (!form.dob) {
            window.alert("Vui lòng chọn ngày sinh.");
            return;
        }

        if (selectedRole === "Học sinh") {
            if (!form.studentInfo.parentName.trim() || form.studentInfo.parentPhone.length !== 10) {
                window.alert("Vui lòng nhập thông tin phụ huynh hợp lệ.");
                return;
            }
        }

        if (selectedRole === "Giáo viên") {
            if (!form.teacherInfo.subject.trim() || form.teacherInfo.phone.length !== 10) {
                window.alert("Vui lòng nhập môn dạy và số điện thoại giáo viên hợp lệ.");
                return;
            }
        }

        const fullName = `${form.lastName} ${form.firstName}`.trim();
        const profile = buildRoleProfile(selectedRole, form);
        const phone = getRolePhone(selectedRole, form);

        const payload = {
            name: fullName,
            lastName: form.lastName.trim(),
            firstName: form.firstName.trim(),
            dob: form.dob,
            email: generatedEmail,
            role: selectedRole,
            phone,
            profile: {
                ...profile,
                lastName: form.lastName.trim(),
                firstName: form.firstName.trim(),
                dob: form.dob,
            },
        };

        onSubmit(payload);
    };

    const handleManagerTitleChange = (val) => {
        const titleData = MANAGEMENT_TITLES.find(t => t.value === val);
        setForm(prev => ({
            ...prev,
            managerInfo: {
                ...prev.managerInfo,
                title: val,
                permissions: titleData ? [...titleData.permissions] : []
            }
        }));
    };

    const togglePermission = (permId) => {
        setForm(prev => {
            const current = prev.managerInfo.permissions;
            const next = current.includes(permId)
                ? current.filter(id => id !== permId)
                : [...current, permId];
            
            return {
                ...prev,
                managerInfo: {
                    ...prev.managerInfo,
                    title: "custom",
                    permissions: next
                }
            };
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file && onImportExcel) {
            onImportExcel(file);
        }
        event.target.value = "";
    };

    const showImportActions = mode === "create" && onImportExcel && onDownloadTemplate;

    return (
        <div className="admin-create-user-dialog-overlay" onClick={onClose}>
            <div
                className="admin-create-user-dialog-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h2>{title}</h2>

                {showImportActions && (
                    <div className="admin-create-user-dialog-excel-actions">
                        <button
                            type="button"
                            className="admin-create-user-dialog-excel-btn"
                            onClick={onDownloadTemplate}
                        >
                            <FiDownload />
                            <span>Tải mẫu Excel</span>
                        </button>

                        <label className="admin-create-user-dialog-excel-btn">
                            <FiUpload />
                            <span>{isImportingExcel ? "Đang nạp..." : "Thêm bằng Excel"}</span>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                disabled={isImportingExcel}
                            />
                        </label>
                    </div>
                )}

                {showImportActions && importFeedback && (
                    <div className={`admin-create-user-dialog-import-feedback ${importFeedback.type}`}>
                        {importFeedback.message}
                    </div>
                )}

                <form className="admin-create-user-dialog-form" onSubmit={handleSubmit}>
                    <div className="admin-create-user-dialog-field-row">
                        <div className="admin-create-user-dialog-field">
                            <label>Họ và tên lót</label>
                            <input
                                type="text"
                                placeholder="Nguyen Hoang Quoc"
                                value={form.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                required
                            />
                        </div>

                        <div className="admin-create-user-dialog-field">
                            <label>Tên</label>
                            <input
                                type="text"
                                placeholder="Kiet"
                                value={form.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-create-user-dialog-field-row">
                        <div className="admin-create-user-dialog-field">
                            <label>Ngày tháng năm sinh</label>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={(e) => handleChange("dob", e.target.value)}
                                required
                            />
                        </div>

                        <div className="admin-create-user-dialog-field">
                            <label>Vai trò</label>
                            {fixedRole ? (
                                <input type="text" value={fixedRole} readOnly />
                            ) : (
                                <Select
                                    variant="custom"
                                    value={form.role}
                                    onChange={(e) => handleChange("role", e.target.value)}
                                    options={normalizedRoleOptions}
                                />
                            )}
                        </div>
                    </div>

                    <div className="admin-create-user-dialog-field">
                        <label>Email</label>
                        <input type="text" value={generatedEmail} readOnly />
                    </div>

                    {selectedRole === "Học sinh" && (
                        <div className="admin-create-user-dialog-role-block">
                            <h3>Thông tin học sinh</h3>

                            <div className="admin-create-user-dialog-field">
                                <label>Tên phụ huynh</label>
                                <input
                                    type="text"
                                    placeholder="Nguyen Van B"
                                    value={form.studentInfo.parentName}
                                    onChange={(e) =>
                                        handleRoleInfoChange("studentInfo", "parentName", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="admin-create-user-dialog-field">
                                <label>Số điện thoại phụ huynh</label>
                                <input
                                    type="tel"
                                    placeholder="0901234567"
                                    value={form.studentInfo.parentPhone}
                                    onChange={(e) =>
                                        handleRoleInfoChange("studentInfo", "parentPhone", e.target.value)
                                    }
                                    inputMode="numeric"
                                    maxLength={10}
                                    required
                                />
                            </div>

                            <label className="admin-create-user-dialog-checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.studentInfo.hasPersonalPhone}
                                    onChange={(e) =>
                                        handleRoleInfoChange(
                                            "studentInfo",
                                            "hasPersonalPhone",
                                            e.target.checked
                                        )
                                    }
                                />
                                <span>Học sinh có số điện thoại cá nhân</span>
                            </label>

                            {form.studentInfo.hasPersonalPhone && (
                                <div className="admin-create-user-dialog-field">
                                    <label>Số điện thoại học sinh</label>
                                    <input
                                        type="tel"
                                        placeholder="0912345678"
                                        value={form.studentInfo.personalPhone}
                                        onChange={(e) =>
                                            handleRoleInfoChange("studentInfo", "personalPhone", e.target.value)
                                        }
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {selectedRole === "Giáo viên" && (
                        <div className="admin-create-user-dialog-role-block">
                            <h3>Thông tin giáo viên</h3>

                            <div className="admin-create-user-dialog-field">
                                <label>Môn chuyên dạy</label>
                                <input
                                    type="text"
                                    placeholder="Toan"
                                    value={form.teacherInfo.subject}
                                    onChange={(e) =>
                                        handleRoleInfoChange("teacherInfo", "subject", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="admin-create-user-dialog-field">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    placeholder="0901234567"
                                    value={form.teacherInfo.phone}
                                    onChange={(e) =>
                                        handleRoleInfoChange("teacherInfo", "phone", e.target.value)
                                    }
                                    inputMode="numeric"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {selectedRole === "Phụ huynh" && (
                        <div className="admin-create-user-dialog-role-block">
                            <div className="admin-create-user-dialog-role-header">
                                <h3>Thông tin phụ huynh</h3>
                                <button
                                    type="button"
                                    className="admin-create-user-dialog-child-add-btn"
                                    onClick={handleAddParentChild}
                                >
                                    +
                                </button>
                            </div>

                            {form.parentInfo.children.map((child, index) => (
                                <div key={`child-${index}`} className="admin-create-user-dialog-child-row">
                                    <div className="admin-create-user-dialog-field-row">
                                        <div className="admin-create-user-dialog-field">
                                            <label>Tên con đang học</label>
                                            <input
                                                type="text"
                                                placeholder="Nguyen Van C"
                                                value={child.childName}
                                                onChange={(e) =>
                                                    handleParentChildChange(
                                                        index,
                                                        "childName",
                                                        e.target.value
                                                    )
                                                }
                                                required={index === 0}
                                            />
                                        </div>

                                        <div className="admin-create-user-dialog-field">
                                            <label>Lớp</label>
                                            <input
                                                type="text"
                                                placeholder="10A1"
                                                value={child.childClass}
                                                onChange={(e) =>
                                                    handleParentChildChange(
                                                        index,
                                                        "childClass",
                                                        e.target.value
                                                    )
                                                }
                                                required={index === 0}
                                            />
                                        </div>
                                    </div>

                                    {form.parentInfo.children.length > 1 && (
                                        <button
                                            type="button"
                                            className="admin-create-user-dialog-child-remove-btn"
                                            onClick={() => handleRemoveParentChild(index)}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div className="admin-create-user-dialog-field">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    placeholder="0901234567"
                                    value={form.parentInfo.phone}
                                    onChange={(e) =>
                                        handleRoleInfoChange("parentInfo", "phone", e.target.value)
                                    }
                                    inputMode="numeric"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {selectedRole === "Quản trị viên" && (
                        <div className="admin-create-user-dialog-role-block">
                            <div className="admin-create-user-dialog-role-header">
                                <h3>Quyền Quản trị hệ thống</h3>
                                <FiShield className="mgr-title-icon" />
                            </div>
                            
                            <div className="admin-create-user-dialog-info-msg" style={{ 
                                fontSize: "0.85rem", 
                                color: "#64748b", 
                                marginBottom: "1rem",
                                padding: "0.75rem",
                                background: "#f1f5f9",
                                borderRadius: "8px",
                                borderLeft: "4px solid #6366f1"
                            }}>
                                Quyền hạn của Quản trị viên được thiết lập cố định để bảo vệ tính toàn vẹn của hệ thống. 
                                Vai trò này không có quyền Xóa vĩnh viễn dữ liệu.
                            </div>

                            <div className="admin-create-user-dialog-perm-groups">
                                <div className="perm-group-item active">
                                    <div className="perm-group-header">
                                        <div className="perm-group-left">
                                            <FiCheck className="perm-group-master-check" style={{ color: "#10b981" }} />
                                            <span className="perm-group-label">Quản lý Hệ thống (Cố định)</span>
                                        </div>
                                    </div>
                                    <div className="perm-group-content">
                                        {AVAILABLE_PERMISSIONS.filter(p => [
                                            PERMISSIONS.USER_VIEW, 
                                            PERMISSIONS.USER_CREATE, 
                                            PERMISSIONS.USER_UPDATE, 
                                            PERMISSIONS.USER_LOCK
                                        ].includes(p.id)).map(perm => (
                                            <label key={perm.id} className="admin-create-user-dialog-checkbox disabled">
                                                <input 
                                                    type="checkbox"
                                                    checked={true}
                                                    readOnly
                                                />
                                                <span style={{ color: "#64748b" }}>{perm.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedRole === "Quản lý" && (
                        <div className="admin-create-user-dialog-role-block">
                            <div className="admin-create-user-dialog-role-header">
                                <h3>Phân quyền quản lý</h3>
                                <FiCheckSquare className="mgr-title-icon" />
                            </div>
                            
                            <div className="admin-create-user-dialog-field">
                                <label>Danh hiệu / Chức vụ</label>
                                <Select
                                    variant="custom"
                                    value={form.managerInfo.title}
                                    onChange={(e) => handleManagerTitleChange(e.target.value)}
                                    options={MANAGEMENT_TITLES}
                                />
                            </div>

                            <div className="admin-create-user-dialog-perm-groups">
                                {PERMISSION_GROUPS.map(group => {
                                    const isExpanded = expandedGroups.includes(group.id);
                                    const selectedInGroup = group.permissions.filter(p => 
                                        form.managerInfo.permissions.includes(p.id)
                                    );
                                    const isAllInGroup = selectedInGroup.length === group.permissions.length;
                                    const isSomeInGroup = selectedInGroup.length > 0 && !isAllInGroup;

                                    return (
                                        <div key={group.id} className={`perm-group-item ${isExpanded ? "active" : ""}`}>
                                            <div className="perm-group-header" onClick={() => toggleGroupExpand(group.id)}>
                                                <div className="perm-group-left">
                                                    <input 
                                                        type="checkbox" 
                                                        className="perm-group-master-check"
                                                        checked={isAllInGroup}
                                                        ref={el => { if (el) el.indeterminate = isSomeInGroup; }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => toggleGroupAll(group.id, e.target.checked)}
                                                    />
                                                    <span className="perm-group-label">{group.label}</span>
                                                    <span className="perm-group-badge">
                                                        {selectedInGroup.length}/{group.permissions.length}
                                                    </span>
                                                </div>
                                                <FiChevronDown className={`perm-group-arrow ${isExpanded ? "up" : ""}`} />
                                            </div>

                                            {isExpanded && (
                                                <div className="perm-group-content">
                                                    {group.permissions
                                                        .filter(perm => perm.id !== PERMISSIONS.USER_DELETE || isAdmin)
                                                        .map(perm => (
                                                            <label key={perm.id} className="admin-create-user-dialog-checkbox">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={form.managerInfo.permissions.includes(perm.id)}
                                                                    onChange={() => togglePermission(perm.id)}
                                                                />
                                                                <span>{perm.label}</span>
                                                            </label>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="admin-create-user-dialog-actions">
                        <button
                            type="button"
                            className="admin-create-user-dialog-btn cancel"
                            onClick={onClose}
                        >
                            Hủy
                        </button>

                        <button type="submit" className="admin-create-user-dialog-btn primary">
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
