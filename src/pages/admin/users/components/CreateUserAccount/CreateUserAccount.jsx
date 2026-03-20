import React, { useEffect, useState } from "react";
import { FiDownload, FiUpload } from "react-icons/fi";
import "./CreateUserAccount.css";

const roleEmailDomainMap = {
    Admin: "admin.edu.vn",
    "Giáo viên": "teacher.edu.vn",
    "Học sinh": "student.edu.vn",
    "Phụ huynh": "parent.edu.vn",
};

function getRoleEmailDomain(role) {
    return roleEmailDomainMap[role] || roleEmailDomainMap["Học sinh"];
}

const defaultForm = {
    name: "",
    email: "",
    role: "Học sinh",
    phone: "",
};

export default function CreateUserAccount({
                                              mode = "create",
                                              title,
                                              submitLabel,
                                              initialData,
                                              onClose,
                                              onSubmit,
                                              onImportExcel,
                                              onDownloadTemplate,
                                              isImportingExcel = false,
                                              importFeedback,
                                          }) {
    const [form, setForm] = useState(defaultForm);

    useEffect(() => {
        if (initialData) {
            const initialEmail = String(initialData.email || "").trim();
            const localPart = initialEmail.split("@")[0] || "";

            setForm({
                name: initialData.name || "",
                email: mode === "create" ? localPart : initialEmail,
                role: initialData.role || "Học sinh",
                phone: String(initialData.phone || "")
                    .replace(/\D/g, "")
                    .slice(0, 10),
            });
        } else {
            setForm(defaultForm);
        }
    }, [initialData, mode]);

    const handleChange = (field, value) => {
        if (field === "phone") {
            const digitsOnly = String(value || "")
                .replace(/\D/g, "")
                .slice(0, 10);

            setForm((prev) => ({
                ...prev,
                phone: digitsOnly,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form.phone && form.phone.length !== 10) {
            window.alert("So dien thoai phai dung 10 chu so.");
            return;
        }

        const emailDomain = getRoleEmailDomain(form.role);
        const emailValue = mode === "create" ? `${form.email}@${emailDomain}` : form.email;

        const payload = {
            name: form.name,
            email: emailValue,
            role: form.role,
            phone: form.phone,
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

    return (
        <div className="create-user-account-overlay" onClick={onClose}>
            <div className="create-user-account-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>

                {mode === "create" && (
                    <div className="create-user-account-excel-actions">
                        <button
                            type="button"
                            className="create-user-account-excel-btn"
                            onClick={onDownloadTemplate}
                        >
                            <FiDownload />
                            <span>Tải mẫu Excel</span>
                        </button>

                        <label className="create-user-account-excel-btn">
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

                {mode === "create" && importFeedback && (
                    <div className={`create-user-account-import-feedback ${importFeedback.type}`}>
                        {importFeedback.message}
                    </div>
                )}

                <form className="create-user-account-form" onSubmit={handleSubmit}>
                    <div className="create-user-account-field">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                    </div>

                    <div className="create-user-account-field">
                        <label>Vai trò</label>
                        <select
                            value={form.role}
                            onChange={(e) => handleChange("role", e.target.value)}
                        >
                            <option value="Admin">Admin</option>
                            <option value="Giáo viên">Giáo viên</option>
                            <option value="Học sinh">Học sinh</option>
                            <option value="Phụ huynh">Phụ huynh</option>
                        </select>
                    </div>

                    <div className="create-user-account-field">
                        <label>Email</label>
                        {mode === "create" ? (
                            <div className="create-user-account-email-group">
                                <input
                                    type="text"
                                    placeholder="nhap.ten"
                                    value={form.email}
                                    onChange={(e) =>
                                        handleChange(
                                            "email",
                                            e.target.value
                                                .trim()
                                                .replace(/\s+/g, "")
                                                .split("@")[0]
                                        )
                                    }
                                    pattern="[A-Za-z0-9._-]+"
                                    title="Chi duoc dung chu, so, dau cham, dau gach ngang va gach duoi"
                                    required
                                />
                                <span className="create-user-account-email-domain">
                                    @{getRoleEmailDomain(form.role)}
                                </span>
                            </div>
                        ) : (
                            <input
                                type="email"
                                placeholder="email@school.edu.vn"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                required
                            />
                        )}
                    </div>

                    <div className="create-user-account-field">
                        <label>Điện thoại</label>
                        <input
                            type="tel"
                            placeholder="0901234567"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="So dien thoai gom 10 chu so"
                        />
                    </div>

                    <div className="create-user-account-actions">
                        <button
                            type="button"
                            className="create-user-account-btn cancel"
                            onClick={onClose}
                        >
                            Hủy
                        </button>

                        <button type="submit" className="create-user-account-btn primary">
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}