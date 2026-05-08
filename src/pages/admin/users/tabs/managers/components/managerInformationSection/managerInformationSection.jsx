import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiChevronDown, FiEdit2, FiX, FiShield, FiCheckSquare } from "react-icons/fi";
import { PERMISSIONS, MANAGEMENT_TITLES, PERMISSION_GROUPS } from "../../../../../../../config/permissions";
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
    const cleanDate = dateString.slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

// Helper component for indeterminate checkbox
function IndeterminateCheckbox({ checked, indeterminate, onChange, className, ...props }) {
    const ref = useRef();
    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <input
            type="checkbox"
            ref={ref}
            className={className}
            checked={checked}
            onChange={onChange}
            {...props}
        />
    );
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
    
    // Bảo vệ Admin: Không cho phép sửa nếu là Quản trị viên
    const isAdminAccount = formData.role === "Quản trị viên";
    
    const title = isEditMode ? "Chỉnh sửa cán bộ" : "Chi tiết cán bộ";
    const submitLabel = isEditMode ? "Lưu thay đổi" : "Đóng";

    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState(["users"]);

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

    const permissions = useMemo(() => {
        if (Array.isArray(formData.permissions)) return formData.permissions;
        if (formData.profile && Array.isArray(formData.profile.permissions)) return formData.profile.permissions;
        return [];
    }, [formData]);

    const managerTitleKey = useMemo(() => {
        if (formData.profile?.titleKey) return formData.profile.titleKey;
        // fallback to title lookup
        const title = formData.profile?.title || formData.position || "";
        const found = MANAGEMENT_TITLES.find(t => t.label === title);
        return found ? found.value : "custom";
    }, [formData]);

    const handlePermissionToggle = (permId) => {
        if (!isEditMode) return;
        const newPerms = permissions.includes(permId)
            ? permissions.filter(id => id !== permId)
            : [...permissions, permId];
        
        // Update both top level and profile to be safe
        onChange("permissions", newPerms);
        if (formData.profile) {
            onChange("profile", { ...formData.profile, permissions: newPerms, titleKey: "custom" });
        }
    };

    const handleGroupToggle = (groupId, checked) => {
        if (!isEditMode) return;
        const group = PERMISSION_GROUPS.find(g => g.id === groupId);
        if (!group) return;
        
        const groupPermIds = group.permissions.map(p => p.id);
        let newPerms;
        if (checked) {
            newPerms = Array.from(new Set([...permissions, ...groupPermIds]));
        } else {
            newPerms = permissions.filter(id => !groupPermIds.includes(id));
        }
        
        onChange("permissions", newPerms);
        if (formData.profile) {
            onChange("profile", { ...formData.profile, permissions: newPerms, titleKey: "custom" });
        }
    };

    const handleTitleChange = (titleKey) => {
        if (!isEditMode) return;
        const found = MANAGEMENT_TITLES.find(t => t.value === titleKey);
        if (!found) return;

        const newPerms = found.permissions || [];
        const newTitleLabel = found.label;

        onChange("permissions", newPerms);
        onChange("role", found.value === "custom" ? formData.role : found.label);
        
        if (formData.profile) {
            onChange("profile", { 
                ...formData.profile, 
                permissions: newPerms, 
                titleKey: titleKey,
                title: newTitleLabel
            });
        }
    };

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
                                {!isAdminAccount && (
                                    <button
                                        type="button"
                                        className="manager-view-icon-btn"
                                        onClick={onRequestEdit}
                                        title="Chỉnh sửa"
                                        aria-label="Chỉnh sửa"
                                    >
                                        <FiEdit2 />
                                    </button>
                                )}
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
                            
                            {/* Chi tiết quyền hạn trong chế độ Xem */}
                            <div className="manager-view-permissions-section">
                                <div className="section-title">
                                    <FiShield /> Chi tiết quyền hạn ({permissions.length})
                                </div>
                                <div className="manager-perm-groups-display">
                                    {PERMISSION_GROUPS.map(g => {
                                        const grantedInGroup = g.permissions.filter(p => permissions.includes(p.id));
                                        if (grantedInGroup.length === 0) return null;
                                        
                                        return (
                                            <div key={g.id} className="perm-group-display-item">
                                                <div className="group-label">{g.label}</div>
                                                <div className="group-perms">
                                                    {grantedInGroup.map(p => (
                                                        <span key={p.id} className="perm-tag-simple">
                                                            {p.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {permissions.length === 0 && <span className="no-perms-msg">Chưa được cấp quyền nào.</span>}
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

                            <div className="manager-form-group full">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => onChange("email", e.target.value)}
                                    placeholder="Nhập địa chỉ email"
                                />
                            </div>

                            <div className="manager-form-grid two-cols">
                                <div className="manager-form-group">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={(() => {
                                            const dob = formData.dob || formData.profile?.dob;
                                            if (!dob || dob === "—" || dob === "--") return "";
                                            
                                            if (/^\d{4}-\d{2}-\d{2}/.test(dob)) return dob.slice(0, 10);
                                            const parts = String(dob).split("/");
                                            if (parts.length === 3 && parts[2].length === 4) {
                                                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                            }
                                            return "";
                                        })()}
                                        onChange={(e) => onChange("dob", e.target.value)}
                                    />
                                </div>

                                <div className="manager-form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={(() => {
                                            const ph = formData.phone || formData.profile?.phone;
                                            if (!ph || ph === "—" || ph === "--") return "";
                                            return ph;
                                        })()}
                                        onChange={(e) => onChange("phone", e.target.value)}
                                        placeholder="09xx xxx xxx"
                                        maxLength={10}
                                    />
                                </div>
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

                            {/* PHẦN PHÂN QUYỀN CHI TIẾT (GIỐNG CREATE) */}
                            <div className="manager-permissions-edit-section">
                                <h3 className="section-header">Phân quyền quản lý</h3>
                                <div className="manager-form-group">
                                    <label>Chức vụ mẫu</label>
                                    <div className="manager-custom-select">
                                        <SelectInternal 
                                            value={managerTitleKey} 
                                            options={MANAGEMENT_TITLES} 
                                            onChange={(val) => handleTitleChange(val)}
                                        />
                                    </div>
                                </div>

                                {managerTitleKey === "custom" && (
                                    <div className="manager-form-group">
                                        <label>Tên chức vụ tùy chỉnh</label>
                                        <input 
                                            type="text" 
                                            value={formData.profile?.customTitle || formData.position || ""} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                onChange("profile", { ...formData.profile, customTitle: val, title: val });
                                            }}
                                            placeholder="VD: Trưởng phòng đào tạo"
                                        />
                                    </div>
                                )}

                                 <div className="admin-create-user-dialog-perm-groups">
                                     {PERMISSION_GROUPS.map(g => (
                                        <div key={g.id} className={`perm-group-item ${expandedGroups.includes(g.id) ? "active" : ""}`}>
                                            <div 
                                                className="perm-group-header" 
                                                onClick={() => setExpandedGroups(p => p.includes(g.id) ? p.filter(id => id !== g.id) : [...p, g.id])}
                                            >
                                                <div className="perm-group-left">
                                                    <IndeterminateCheckbox 
                                                        className="perm-group-master-check"
                                                        checked={g.permissions.every(p => permissions.includes(p.id))}
                                                        indeterminate={
                                                            g.permissions.some(p => permissions.includes(p.id)) && 
                                                            !g.permissions.every(p => permissions.includes(p.id))
                                                        }
                                                        onChange={e => handleGroupToggle(g.id, e.target.checked)}
                                                        onClick={e => e.stopPropagation()} 
                                                    />
                                                    <span className="perm-group-label">{g.label}</span>
                                                </div>
                                                <FiChevronDown className={`perm-group-arrow ${expandedGroups.includes(g.id) ? "up" : ""}`} />
                                            </div>
                                            {expandedGroups.includes(g.id) && (
                                                <div className="perm-group-content">
                                                    {g.permissions.map(p => (
                                                        <label key={p.id} className="admin-create-user-dialog-checkbox">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={permissions.includes(p.id)} 
                                                                onChange={() => handlePermissionToggle(p.id)} 
                                                            />
                                                            <span>{p.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
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

// Helper component for internal select
function SelectInternal({ value, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || "Chọn chức vụ";

    return (
        <div className="manager-custom-select" ref={ref}>
            <div className={`manager-custom-select-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedLabel}</span>
                <FiChevronDown className={`manager-select-icon ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="manager-custom-select-options">
                    {options.map((o) => (
                        <div
                            key={o.value}
                            className={`manager-custom-select-option ${value === o.value ? 'active' : ''}`}
                            onClick={() => {
                                onChange(o.value);
                                setIsOpen(false);
                            }}
                        >
                            {o.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

