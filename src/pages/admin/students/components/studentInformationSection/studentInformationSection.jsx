import React from "react";
import "./studentInformationSection.css";

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

export default function StudentInformationSection({
    mode = "create",
    formData,
    classOptions,
    teacherName,
    onChange,
    onClose,
    onSubmit,
}) {
    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";
    const title = isEditMode ? "Chỉnh sửa học sinh" : "Thêm học sinh mới";
    const submitLabel = isEditMode ? "Lưu" : "Tạo mới";

    return (
        <div className="student-modal-overlay" onClick={onClose}>
            <div className={`student-modal ${isViewMode ? "student-modal-view" : ""}`} onClick={(e) => e.stopPropagation()}>
                {isViewMode ? (
                    <>
                        <div className="student-view-header">
                            <div className="student-view-avatar">{getAvatarLetter(formData.name)}</div>
                            <div className="student-view-title-wrap">
                                <h3>{formData.name}</h3>
                                <p>
                                    {formData.className} • {formData.gender}
                                </p>
                            </div>
                        </div>

                        <div className="student-view-list">
                            <div className="student-view-row">
                                <span>Ngày sinh</span>
                                <strong>{formData.dob || "--"}</strong>
                            </div>
                            <div className="student-view-row">
                                <span>GVCN</span>
                                <strong>{teacherName || "--"}</strong>
                            </div>
                            <div className="student-view-row">
                                <span>Địa chỉ</span>
                                <strong>{formData.address || "--"}</strong>
                            </div>
                            <div className="student-view-row">
                                <span>Phụ huynh</span>
                                <strong>{formData.parentName || "--"}</strong>
                            </div>
                            <div className="student-view-row">
                                <span>SĐT phụ huynh</span>
                                <strong>{formData.parentPhone || "--"}</strong>
                            </div>
                            <div className="student-view-row">
                                <span>Email phụ huynh</span>
                                <strong>{formData.parentEmail || "--"}</strong>
                            </div>
                        </div>

                        <div className="student-modal-actions single">
                            <button className="student-cancel-btn" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>{title}</h2>

                        <div className="student-modal-form">
                            <div className="student-form-group full">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => onChange("name", e.target.value)}
                                />
                            </div>

                            <div className="student-form-grid two-cols">
                                <div className="student-form-group">
                                    <label>Lớp</label>
                                    <select
                                        value={formData.className}
                                        onChange={(e) => onChange("className", e.target.value)}
                                    >
                                        {classOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="student-form-group">
                                    <label>Giới tính</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => onChange("gender", e.target.value)}
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="student-form-grid two-cols">
                                <div className="student-form-group">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={formData.dob}
                                        onChange={(e) => onChange("dob", e.target.value)}
                                    />
                                </div>

                                <div className="student-form-group">
                                    <label>Tên phụ huynh</label>
                                    <input
                                        type="text"
                                        value={formData.parentName}
                                        onChange={(e) => onChange("parentName", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="student-form-grid two-cols">
                                <div className="student-form-group">
                                    <label>SĐT phụ huynh</label>
                                    <input
                                        type="text"
                                        value={formData.parentPhone}
                                        onChange={(e) => onChange("parentPhone", e.target.value)}
                                    />
                                </div>

                                <div className="student-form-group">
                                    <label>Email phụ huynh</label>
                                    <input
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={(e) => onChange("parentEmail", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="student-form-group full">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => onChange("address", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="student-modal-actions">
                            <button className="student-cancel-btn" onClick={onClose}>
                                Hủy
                            </button>
                            <button className="student-submit-btn" onClick={onSubmit}>
                                {submitLabel}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}