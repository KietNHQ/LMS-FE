import React, { useState } from "react";
import { FiX, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import "./parentInformationSection.css";

function getInitials(name) {
    const words = String(name || "P")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return "P";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
}

function buildFallbackAvatar(name) {
    const initials = getInitials(name);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
<rect width='120' height='120' fill='#d8c8ff'/>
<text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='48' font-weight='700' fill='#5f439d'>${initials}</text>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getParentAvatarSrc(formData) {
    return formData?.avatarUrl || formData?.profile?.avatarUrl || buildFallbackAvatar(formData?.name);
}

export default function ParentInformationSection({
    mode,
    formData,
    onChange,
    onClose,
    onSubmit,
    onRequestEdit,
}) {
    const isViewOnly = mode === "view";

    // Manage children locally since they might be an array in profile
    const [children, setChildren] = useState(
        isViewOnly && formData.displayChildren
            ? formData.displayChildren
            : formData.profile?.children || []
    );

    const handleAddChild = () => {
        setChildren([...children, { childName: "", childClass: "" }]);
    };

    const handleChildChange = (index, field, value) => {
        const newChildren = [...children];
        newChildren[index][field] = value;
        setChildren(newChildren);

        // Propagate up so parent state gets updated if necessary
        // In a real app we would sync this to formData.profile.children
        // Here we can just call onChange and let the parent handle it
        onChange("children", newChildren);
    };

    const handleRemoveChild = (index) => {
        const newChildren = children.filter((_, i) => i !== index);
        setChildren(newChildren);
        onChange("children", newChildren);
    };

    const handleSave = () => {
        // Ensure children state is synced
        onChange("children", children);
        onSubmit();
    };

    const avatarSrc = getParentAvatarSrc(formData);

    return (
        <div className="parent-info-overlay" onClick={onClose}>
            <div className="parent-info-modal" onClick={(e) => e.stopPropagation()}>
                <div className="parent-info-header">
                    <div className="parent-info-title-wrap">
                        {isViewOnly && (
                            <div className="parent-info-header-avatar">
                                <img src={avatarSrc} alt={`Anh phu huynh ${formData.name || ""}`} />
                            </div>
                        )}
                        <h2>
                            {mode === "view" && "Chi tiết phụ huynh"}
                            {mode === "edit" && "Chỉnh sửa phụ huynh"}
                        </h2>
                    </div>
                    <div className="parent-info-header-actions">
                        {isViewOnly && (
                            <button
                                className="parent-info-edit"
                                onClick={onRequestEdit}
                                title="Chỉnh sửa"
                                aria-label="Chỉnh sửa"
                            >
                                <FiEdit2 />
                            </button>
                        )}
                        <button className="parent-info-close" onClick={onClose} title="Đóng">
                            <FiX />
                        </button>
                    </div>
                </div>

                <div className="parent-info-body">
                    <div className="parent-info-grid">
                        <div className="parent-info-field">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                value={formData.name || ""}
                                onChange={(e) => onChange("name", e.target.value)}
                                disabled={isViewOnly}
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>

                        <div className="parent-info-field">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                value={formData.dob || ""}
                                onChange={(e) => onChange("dob", e.target.value)}
                                disabled={isViewOnly}
                            />
                        </div>

                        <div className="parent-info-field">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => onChange("email", e.target.value)}
                                disabled={isViewOnly}
                            />
                        </div>

                        <div className="parent-info-field">
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                value={formData.phone || ""}
                                onChange={(e) => onChange("phone", e.target.value)}
                                disabled={isViewOnly}
                                placeholder="Đủ 10 số, VD: 0912345678"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div className="parent-children-section">
                        <div className="parent-children-header">
                            <h3>Học sinh đang quản lý</h3>
                            {!isViewOnly && (
                                <button type="button" className="btn-add-child" onClick={handleAddChild}>
                                    <FiPlus /> Thêm học sinh
                                </button>
                            )}
                        </div>

                        {children.length === 0 ? (
                            <p className="no-children-msg">Chưa có thông tin học sinh.</p>
                        ) : (
                            <div className="parent-children-list">
                                {children.map((child, index) => (
                                    <div key={index} className="child-item-card">
                                        <div className="child-info-inputs">
                                            <div className="parent-info-field">
                                                <label>Tên học sinh {index + 1}</label>
                                                <input
                                                    type="text"
                                                    value={child.childName}
                                                    onChange={(e) => handleChildChange(index, "childName", e.target.value)}
                                                    disabled={isViewOnly}
                                                    placeholder="VD: Nguyễn Văn B"
                                                />
                                            </div>
                                            <div className="parent-info-field">
                                                <label>Lớp học</label>
                                                <input
                                                    type="text"
                                                    value={child.childClass}
                                                    onChange={(e) => handleChildChange(index, "childClass", e.target.value.toUpperCase())}
                                                    disabled={isViewOnly}
                                                    placeholder="VD: 10A1"
                                                />
                                            </div>
                                        </div>
                                        {!isViewOnly && (
                                            <button
                                                type="button"
                                                className="btn-remove-child"
                                                onClick={() => handleRemoveChild(index)}
                                                title="Xóa học sinh này"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {!isViewOnly && (
                    <div className="parent-info-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Hủy bỏ
                        </button>
                        <button type="button" className="btn-save" onClick={handleSave}>
                            Lưu thông tin
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
