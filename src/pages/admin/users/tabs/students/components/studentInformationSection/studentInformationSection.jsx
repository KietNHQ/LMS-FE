import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiEdit2, FiX } from "react-icons/fi";
import "./studentInformationSection.css";
import { userService } from "../../../../../../../services/pages/admin/users";

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

function getStatusClass(status) {
    switch (status) {
        case "Đang học": return "status-active";
        case "Đình chỉ": return "status-suspended";
        case "Bảo lưu": return "status-reserved";
        case "Đã tốt nghiệp": return "status-graduated";
        default: return "status-active";
    }
}

function formatDisplayDate(dateString) {
    if (!dateString) return "--";
    const parts = dateString.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

export default function StudentInformationSection({
    mode = "create",
    formData,
    classOptions,
    teacherName,
    onChange,
    onClose,
    onSubmit,
    onRequestEdit,
}) {
    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";
    const title = isEditMode ? "Chỉnh sửa học sinh" : "Thêm học sinh mới";
    const submitLabel = isEditMode ? "Lưu" : "Tạo mới";

    const [isClassOpen, setIsClassOpen] = useState(false);
    const [isGenderOpen, setIsGenderOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const classRef = useRef(null);
    const genderRef = useRef(null);
    const statusRef = useRef(null);

    const handlePhoneBlur = async (phone) => {
        if (!phone || phone.length < 9) return;
        try {
            const res = await userService.getGuardianByPhone(phone);
            // res is the raw axios response; data contains the API payload
            const apiPayload = res?.data ?? res ?? {};
            const parent = (apiPayload?.guardians ?? apiPayload?.data ?? [])[0];
            if (parent) {
                const fullName = `${parent.surname || ''} ${parent.given_name || ''}`.trim() || parent.name || '';
                onChange("parentName", fullName);
                onChange("parentEmail", parent.email || parent.user_email || '');
                onChange("guardianId", parent.id); // integer guardian table ID
                console.log('[handlePhoneBlur] Found guardian:', parent.id, fullName);
            } else {
                console.log('[handlePhoneBlur] No guardian found for phone:', phone);
            }
        } catch (error) {
            console.log("Không tìm thấy phụ huynh", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (classRef.current && !classRef.current.contains(event.target)) setIsClassOpen(false);
            if (genderRef.current && !genderRef.current.contains(event.target)) setIsGenderOpen(false);
            if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="student-modal-overlay" onClick={onClose}>
            <div className={`student-modal ${isViewMode ? "student-modal-view" : ""}`} onClick={(e) => e.stopPropagation()}>
                {isViewMode ? (
                    <>
                        <div className="student-view-header">
                            <div className="student-view-main">
                                <div className="student-view-avatar">{getAvatarLetter(formData.name)}</div>
                                <div className="student-view-title-wrap">
                                    <h3>{formData.name}</h3>
                                    <p>
                                        {formData.className} • {formData.gender}
                                    </p>
                                </div>
                            </div>
                            <div className="student-view-header-actions">
                                <button
                                    type="button"
                                    className="student-view-icon-btn"
                                    onClick={onRequestEdit}
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    type="button"
                                    className="student-view-icon-btn"
                                    onClick={onClose}
                                    title="Đóng"
                                    aria-label="Đóng"
                                >
                                    <FiX />
                                </button>
                            </div>
                        </div>

                        <div className="student-view-list">
                            <div className="student-view-row">
                                <span>Ngày sinh</span>
                                <strong>{formatDisplayDate(formData.dob)}</strong>
                            </div>
                            <div className="student-view-row">
                                <span>Email học sinh</span>
                                <strong>{formData.email || "--"}</strong>
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
                            <div className="student-view-row">
                                <span>Trạng thái</span>
                                <strong>
                                    <span className={`student-status-badge ${getStatusClass(formData.status)}`}>{formData.status || "--"}</span>
                                </strong>
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
                                    <div className="student-custom-select" ref={classRef}>
                                        <div
                                            className={`student-custom-select-trigger ${isClassOpen ? 'active' : ''}`}
                                            onClick={() => {
                                                setIsClassOpen(!isClassOpen);
                                                setIsGenderOpen(false);
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            <span>{formData.className || "Chọn lớp"}</span>
                                            <FiChevronDown className={`student-select-icon ${isClassOpen ? 'open' : ''}`} />
                                        </div>
                                        {isClassOpen && (
                                            <div className="student-custom-select-options">
                                                {classOptions.map((item) => (
                                                    <div
                                                        key={item}
                                                        className={`student-custom-select-option ${formData.className === item ? 'active' : ''}`}
                                                        onClick={() => {
                                                            onChange("className", item);
                                                            setIsClassOpen(false);
                                                        }}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="student-form-group">
                                    <label>Giới tính</label>
                                    <div className="student-custom-select" ref={genderRef}>
                                        <div
                                            className={`student-custom-select-trigger ${isGenderOpen ? 'active' : ''}`}
                                            onClick={() => {
                                                setIsGenderOpen(!isGenderOpen);
                                                setIsClassOpen(false);
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            <span>{formData.gender || "Chọn giới tính"}</span>
                                            <FiChevronDown className={`student-select-icon ${isGenderOpen ? 'open' : ''}`} />
                                        </div>
                                        {isGenderOpen && (
                                            <div className="student-custom-select-options">
                                                {["Nam", "Nữ"].map((item) => (
                                                    <div
                                                        key={item}
                                                        className={`student-custom-select-option ${formData.gender === item ? 'active' : ''}`}
                                                        onClick={() => {
                                                            onChange("gender", item);
                                                            setIsGenderOpen(false);
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

                            <div className="student-form-grid two-cols">
                                <div className="student-form-group">
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

                                <div className="student-form-group">
                                    <label>Email học sinh</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => onChange("email", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="student-form-grid two-cols">
                                <div className="student-form-group">
                                    <label>Tên phụ huynh</label>
                                    <input
                                        type="text"
                                        value={formData.parentName}
                                        onChange={(e) => onChange("parentName", e.target.value)}
                                    />
                                </div>

                                <div className="student-form-group">
                                    <label>SĐT phụ huynh</label>
                                    <input
                                        type="text"
                                        value={(() => {
                                            const ph = formData.parentPhone || formData.profile?.parentPhone;
                                            if (!ph || ph === "—" || ph === "--") return "";
                                            return ph;
                                        })()}
                                        onChange={(e) => onChange("parentPhone", e.target.value)}
                                        onBlur={(e) => handlePhoneBlur(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="student-form-grid two-cols">
                                <div className="student-form-group">
                                    <label>Email phụ huynh</label>
                                    <input
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={(e) => onChange("parentEmail", e.target.value)}
                                    />
                                </div>
                                <div className="student-form-group">
                                    <label>Trạng thái</label>
                                    <div className="student-custom-select" ref={statusRef}>
                                        <div
                                            className={`student-custom-select-trigger ${isStatusOpen ? 'active' : ''}`}
                                            onClick={() => {
                                                setIsStatusOpen(!isStatusOpen);
                                                setIsClassOpen(false);
                                                setIsGenderOpen(false);
                                            }}
                                        >
                                            <span>{formData.status || "Đang học"}</span>
                                            <FiChevronDown className={`student-select-icon ${isStatusOpen ? 'open' : ''}`} />
                                        </div>
                                        {isStatusOpen && (
                                            <div className="student-custom-select-options">
                                                {["Đang học", "Đình chỉ", "Bảo lưu", "Đã tốt nghiệp"].map((item) => (
                                                    <div
                                                        key={item}
                                                        className={`student-custom-select-option ${formData.status === item ? 'active' : ''}`}
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
