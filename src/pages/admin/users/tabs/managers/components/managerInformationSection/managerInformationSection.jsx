import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiEdit2, FiX } from "react-icons/fi";
import "./managerInformationSection.css";

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

function getStatusClass(status) {
    return status === "Hoạt động" ? "status-active" : "status-suspended";
}

function formatDisplayDate(dateString) {
    if (!dateString) return "--";
    // If it's ISO format, take YYYY-MM-DD
    const cleanDate = dateString.slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

export default function ManagerInformationSection({
    mode = "view",
    formData,
    roleOptions = [],
    onChange,
    onClose,
    onSubmit,
    onRequestEdit,
}) {
    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";
    const title = isEditMode ? "Chỉnh sửa cán bộ" : "Thêm cán bộ mới";
    const submitLabel = isEditMode ? "Lưu thay đổi" : "Tạo mới";

    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const roleRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleRef.current && !roleRef.current.contains(event.target)) setIsRoleOpen(false);
            if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const permissions = Array.isArray(formData.permissions) ? formData.permissions : [];
    const permissionsCount = permissions.length;

    return (
        <div className="manager-modal-overlay" onClick={onClose}>
            <div className={`manager-modal ${isViewMode ? "manager-modal-view" : ""}`} onClick={(e) => e.stopPropagation()}>
                {isViewMode ? (
                    <>
                        <div className="manager-view-header">
                            <div className="manager-view-main">
                                <div className="manager-view-avatar">{getAvatarLetter(formData.name)}</div>
                                <div className="manager-view-title-wrap">
                                    <h3>{formData.name}</h3>
                                    <p>
                                        {formData.role} • {formData.email}
                                    </p>
                                </div>
                            </div>
                            <div className="manager-view-header-actions">
                                <button
                                    type="button"
                                    className="manager-view-icon-btn"
                                    onClick={onRequestEdit}
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    type="button"
                                    className="manager-view-icon-btn"
                                    onClick={onClose}
                                    title="Đóng"
                                    aria-label="Đóng"
                                >
                                    <FiX />
                                </button>
                            </div>
                        </div>

                        <div className="manager-view-list">
                            <div className="manager-view-row">
                                <span>Ngày sinh</span>
                                <strong>{formatDisplayDate(formData.dob)}</strong>
                            </div>
                            <div className="manager-view-row">
                                <span>Số điện thoại</span>
                                <strong>{formData.phone || "--"}</strong>
                            </div>
                            <div className="manager-view-row permissions">
                                <span>Quyền hạn</span>
                                <div className="manager-permissions-list">
                                    {permissions.length === 0 ? (
                                        <span className="no-permissions">0 quyền được cấp</span>
                                    ) : (
                                        permissions.map((p, idx) => (
                                            <span key={idx} className="permission-tag">
                                                {p.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="manager-view-row">
                                <span>Trạng thái</span>
                                <strong>
                                    <span className={`manager-status-badge ${getStatusClass(formData.status)}`}>
                                        {formData.status || "--"}
                                    </span>
                                </strong>
                            </div>
                        </div>

                        <div className="manager-modal-actions single">
                            <button className="manager-cancel-btn" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>{title}</h2>

                        <div className="manager-modal-form">
                            <div className="manager-form-group full">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => onChange("name", e.target.value)}
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div className="manager-form-grid two-cols">
                                <div className="manager-form-group">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => onChange("dob", e.target.value)}
                                    />
                                </div>

                                <div className="manager-form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => onChange("phone", e.target.value)}
                                        placeholder="09xx xxx xxx"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            <div className="manager-form-group full">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => onChange("email", e.target.value)}
                                    placeholder="email@thptlocal.edu.vn"
                                    readOnly={isEditMode}
                                />
                            </div>

                            <div className="manager-form-grid two-cols">
                                <div className="manager-form-group">
                                    <label>Vai trò</label>
                                    <div className="manager-custom-select" ref={roleRef}>
                                        <div
                                            className={`manager-custom-select-trigger ${isRoleOpen ? 'active' : ''}`}
                                            onClick={() => {
                                                setIsRoleOpen(!isRoleOpen);
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            <span>{formData.role || "Chọn vai trò"}</span>
                                            <FiChevronDown className={`manager-select-icon ${isRoleOpen ? 'open' : ''}`} />
                                        </div>
                                        {isRoleOpen && (
                                            <div className="manager-custom-select-options">
                                                {roleOptions.map((item) => (
                                                    <div
                                                        key={item.value || item}
                                                        className={`manager-custom-select-option ${formData.role === (item.value || item) ? 'active' : ''}`}
                                                        onClick={() => {
                                                            onChange("role", item.value || item);
                                                            setIsRoleOpen(false);
                                                        }}
                                                    >
                                                        {item.label || item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="manager-form-group">
                                    <label>Trạng thái</label>
                                    <div className="manager-custom-select" ref={statusRef}>
                                        <div
                                            className={`manager-custom-select-trigger ${isStatusOpen ? 'active' : ''}`}
                                            onClick={() => {
                                                setIsStatusOpen(!isStatusOpen);
                                                setIsRoleOpen(false);
                                            }}
                                        >
                                            <span>{formData.status || "Hoạt động"}</span>
                                            <FiChevronDown className={`manager-select-icon ${isStatusOpen ? 'open' : ''}`} />
                                        </div>
                                        {isStatusOpen && (
                                            <div className="manager-custom-select-options">
                                                {["Hoạt động", "Vô hiệu hóa"].map((item) => (
                                                    <div
                                                        key={item}
                                                        className={`manager-custom-select-option ${formData.status === item ? 'active' : ''}`}
                                                        onClick={() => {
                                                            onChange("status", item);
                                                            setIsStatusOpen(false);
                                                        }}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="manager-modal-actions">
                            <button className="manager-cancel-btn" onClick={onClose}>
                                Hủy
                            </button>
                            <button className="manager-submit-btn" onClick={onSubmit}>
                                {submitLabel}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
