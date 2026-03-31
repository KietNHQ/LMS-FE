import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiDownload, FiUpload, FiChevronDown } from "react-icons/fi";
import "./CreateUserDialog.css";

const allRoleOptions = ["Admin", "Phụ huynh", "Học sinh", "Giáo viên"];

const roleEmailDomainMap = {
    Admin: "admin.email.edu.vn",
    "Giáo viên": "teacher.email.edu.vn",
    "Học sinh": "student.email.edu.vn",
    "Phụ huynh": "parent.email.edu.vn",
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
    };
}

function buildFormFromInitialData(initialData, mode, role) {
    if (!initialData) {
        return buildDefaultForm(role);
    }

    const profile = initialData.profile || {};
    const parsed = parseFullName(initialData.name);

    const initialChildren = Array.isArray(profile.children)
        ? profile.children
            .map((child) => ({
                childName: String(child?.childName || "").trim(),
                childClass: String(child?.childClass || "").trim(),
            }))
            .filter((child) => child.childName || child.childClass)
        : [];

    const fallbackChild = {
        childName: String(profile.childName || "").trim(),
        childClass: String(profile.childClass || "").trim(),
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
        dob: profile.dob || "",
        role,

        studentInfo: {
            parentName: profile.parentName || "",
            parentPhone: normalizePhone(profile.parentPhone || ""),
            hasPersonalPhone: Boolean(profile.hasPersonalPhone),
            personalPhone: normalizePhone(profile.personalPhone || ""),
        },
        teacherInfo: {
            subject: profile.subject || "",
            phone: normalizePhone(profile.phone || (role === "Giáo viên" ? initialData.phone : "")),
        },
        parentInfo: {
            children: resolvedChildren,
            phone: normalizePhone(profile.phone || (role === "Phụ huynh" ? initialData.phone : "")),
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
    const normalizedRoleOptions = useMemo(() => {
        if (!Array.isArray(roleOptions) || roleOptions.length === 0) {
            return allRoleOptions;
        }

        return roleOptions;
    }, [roleOptions]);

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
            window.alert("Vui long nhap day du ho va ten.");
            return;
        }

        if (!form.dob) {
            window.alert("Vui long chon ngay sinh.");
            return;
        }

        if (selectedRole === "Học sinh") {
            if (!form.studentInfo.parentName.trim() || form.studentInfo.parentPhone.length !== 10) {
                window.alert("Vui long nhap thong tin phu huynh hop le.");
                return;
            }

            if (form.studentInfo.hasPersonalPhone && form.studentInfo.personalPhone.length !== 10) {
                window.alert("So dien thoai ca nhan hoc sinh phai du 10 chu so.");
                return;
            }
        }

        if (selectedRole === "Giáo viên") {
            if (!form.teacherInfo.subject.trim() || form.teacherInfo.phone.length !== 10) {
                window.alert("Vui long nhap mon day va so dien thoai giao vien hop le.");
                return;
            }
        }

        if (selectedRole === "Phụ huynh") {
            const hasInvalidChild = form.parentInfo.children.some((child) => {
                const childName = String(child.childName || "").trim();
                const childClass = String(child.childClass || "").trim();

                return (childName && !childClass) || (!childName && childClass);
            });

            const completedChildren = form.parentInfo.children.filter((child) => {
                const childName = String(child.childName || "").trim();
                const childClass = String(child.childClass || "").trim();
                return childName && childClass;
            });

            if (
                completedChildren.length === 0 ||
                hasInvalidChild ||
                form.parentInfo.phone.length !== 10
            ) {
                window.alert("Vui long nhap day du thong tin phu huynh.");
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
                                <div className="admin-custom-select" ref={roleRef}>
                                    <div
                                        className={`admin-custom-select-trigger ${isRoleOpen ? "active" : ""}`}
                                        onClick={() => setIsRoleOpen(!isRoleOpen)}
                                    >
                                        <span>{form.role}</span>
                                        <FiChevronDown className={`admin-select-icon ${isRoleOpen ? "open" : ""}`} />
                                    </div>
                                    {isRoleOpen && (
                                        <div className="admin-custom-select-options">
                                            {normalizedRoleOptions.map((r) => (
                                                <div
                                                    key={r}
                                                    className={`admin-custom-select-option ${form.role === r ? "active" : ""}`}
                                                    onClick={() => {
                                                        handleChange("role", r);
                                                        setIsRoleOpen(false);
                                                    }}
                                                >
                                                    {r}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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



