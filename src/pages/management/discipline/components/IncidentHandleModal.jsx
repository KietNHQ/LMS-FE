import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiUser, FiCalendar, FiClock, FiActivity, FiMessageSquare, FiCpu, FiUserPlus, FiShield, FiInfo, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../../components/ui/Select/Select";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge";
import "./IncidentHandleModal.css";

const STATUS_FLOW = [
    { value: 'new', label: 'Mới ghi nhận', color: 'red' },
    { value: 'processing', label: 'Đang xử lý', color: 'orange' },
    { value: 'resolved', label: 'Đã giải quyết', color: 'green' },
    { value: 'closed', label: 'Đã đóng', color: 'gray' }
];

const DISCIPLINE_STAFF = [
    { value: "Giám thị 01", label: "Giám thị 01" },
    { value: "Giám thị 02", label: "Giám thị 02" },
    { value: "GVCN Lớp", label: "GVCN Lớp" },
    { value: "PHT Nề nếp", label: "PHT Nề nếp" },
];

export default function IncidentHandleModal({ isOpen, onClose, incident, onUpdateIncident }) {
    const [activeTab, setActiveTab] = useState("handle"); 
    const [assignedTo, setAssignedTo] = useState("");
    const [note, setNote] = useState("");
    const [status, setStatus] = useState("new");

    useEffect(() => {
        if (incident) {
            setAssignedTo(incident.assignedTo || "");
            setStatus(incident.status || "new");
            setNote(incident.handleNote || "");
        }
    }, [incident]);

    if (!isOpen || !incident) return null;

    const handleSave = () => {
        const updatedData = {
            ...incident,
            status: status,
            assignedTo: assignedTo,
            handleNote: note,
            lastUpdated: new Date().toLocaleDateString('vi-VN'),
        };
        onUpdateIncident(updatedData);
        toast.success(`Đã cập nhật sự vụ cho ${incident.student}`);
        onClose();
    };

    // Logic to determine if a status step is accessible
    const canSelectStatus = (targetStatus) => {
        const currentIndex = STATUS_FLOW.findIndex(s => s.value === incident.status);
        const targetIndex = STATUS_FLOW.findIndex(s => s.value === targetStatus);
        
        // Always allow selecting current status
        if (targetStatus === status) return true;
        
        // Allow moving forward by 1 step or keeping current
        // Or if it's already resolved/closed, allow moving between them if needed (admin discretion)
        // But for a "guided" workflow, let's allow moving forward.
        return targetIndex >= currentIndex; 
    };

    const handleStatusClick = (targetStatus) => {
        if (!canSelectStatus(targetStatus)) {
            toast.warning("Vui lòng thực hiện theo đúng trình tự quy trình.");
            return;
        }
        setStatus(targetStatus);
    };

    return (
        <div className="ihm-overlay" onClick={onClose}>
            <div className="ihm-container" onClick={e => e.stopPropagation()}>
                {/* Header matching ViolationRecordModal style */}
                <div className="ihm-header">
                    <div className="ihm-header-icon">
                        <FiShield />
                    </div>
                    <div className="ihm-header-text">
                        <h2>Xử Lý Sự Vụ</h2>
                        <p>Mã sự vụ: <strong>#{incident.id}</strong></p>
                    </div>
                    <button className="ihm-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="ihm-tabs-nav">
                    <button className={`tab-link ${activeTab === 'handle' ? 'active' : ''}`} onClick={() => setActiveTab('handle')}>
                        <FiCpu /> Điều hành
                    </button>
                    <button className={`tab-link ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
                        <FiClock /> Lịch sử
                    </button>
                    <button className={`tab-link ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                        <FiInfo /> Hồ sơ gốc
                    </button>
                </div>

                <div className="ihm-body custom-scrollbar">
                    {activeTab === 'handle' && (
                        <div className="ihm-tab-content animate-fade-in">
                            <div className="ihm-student-mini-card">
                                <div className="mini-avatar">{incident.student.charAt(0)}</div>
                                <div className="mini-info">
                                    <h4>{incident.student}</h4>
                                    <div className="mini-meta">
                                        <span>Lớp: <strong>{incident.class}</strong></span>
                                        <span className="dot"></span>
                                        <span>Lỗi: <strong>{incident.type}</strong></span>
                                        <span className="dot"></span>
                                        <span>Mức độ: <StatusBadge status={incident.level}>{incident.level === 'high' ? 'Nghiêm trọng' : (incident.level === 'med' ? 'Vừa' : 'Nhẹ')}</StatusBadge></span>
                                    </div>
                                </div>
                            </div>

                            <div className="ihm-section-group">
                                <label className="ihm-label-group"><FiActivity /> Quy trình xử lý hiện tại</label>
                                <div className="workflow-stepper">
                                    {STATUS_FLOW.map((s, idx) => {
                                        const isCurrent = status === s.value;
                                        const isPast = STATUS_FLOW.findIndex(step => step.value === status) > idx;
                                        const isDisabled = !canSelectStatus(s.value);

                                        return (
                                            <React.Fragment key={s.value}>
                                                <div 
                                                    className={`workflow-step ${isCurrent ? 'active' : ''} ${isPast ? 'completed' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    onClick={() => handleStatusClick(s.value)}
                                                >
                                                    <div className="step-circle">
                                                        {isPast ? <FiCheck /> : idx + 1}
                                                    </div>
                                                    <span className="step-label">{s.label}</span>
                                                </div>
                                                {idx < STATUS_FLOW.length - 1 && <div className="step-line"></div>}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="ihm-grid">
                                <div className="ihm-col">
                                    <Select 
                                        label="Người phụ trách xử lý"
                                        placeholder="Chọn nhân sự..."
                                        options={DISCIPLINE_STAFF}
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        variant="custom"
                                        searchable
                                    />
                                </div>
                                <div className="ihm-col">
                                    <div className="ui-select">
                                        <label className="ui-select__label">Hạn giải quyết (Dự kiến)</label>
                                        <input type="date" className="ihm-date-input" defaultValue="2026-04-25" />
                                    </div>
                                </div>
                            </div>

                            <div className="ihm-field-full mt-lg">
                                <label className="ui-select__label">Nội dung chỉ đạo & Cập nhật</label>
                                <textarea 
                                    className="ihm-textarea"
                                    placeholder="Nhập yêu cầu xử lý hoặc nhật ký quá trình cụ thể tại đây..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="ihm-tab-content animate-fade-in">
                            <div className="ihm-timeline">
                                <div className="timeline-point">
                                    <div className="point-marker"></div>
                                    <div className="point-content">
                                        <div className="point-header">
                                            <span className="point-time">09:00 - 21/04/2026</span>
                                            <StatusBadge status="new">Ghi nhận</StatusBadge>
                                        </div>
                                        <p><strong>{incident.reporter}</strong> đã ghi nhận vi phạm ban đầu vào hệ thống.</p>
                                    </div>
                                </div>
                                {status !== 'new' && (
                                    <div className="timeline-point active">
                                        <div className="point-marker pulse"></div>
                                        <div className="point-content">
                                            <div className="point-header">
                                                <span className="point-time">Hiện tại</span>
                                                <StatusBadge status={status}>{getStatusLabel(status)}</StatusBadge>
                                            </div>
                                            <p>Sự vụ đang được <strong>{assignedTo || "Ban nề nếp"}</strong> xử lý.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="ihm-tab-content animate-fade-in">
                            <div className="ihm-details-box">
                                <div className="detail-row">
                                    <div className="detail-cell">
                                        <label>Học sinh</label>
                                        <span>{incident.student} ({incident.class})</span>
                                    </div>
                                    <div className="detail-cell">
                                        <label>Người lập hồ sơ</label>
                                        <span>{incident.reporter}</span>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-cell">
                                        <label>Thời gian</label>
                                        <span>{incident.date}</span>
                                    </div>
                                    <div className="detail-cell">
                                        <label>Mức độ</label>
                                        <StatusBadge status={incident.level}>{incident.level}</StatusBadge>
                                    </div>
                                </div>
                                <div className="detail-memo">
                                    <label>Mô tả chi tiết vi phạm:</label>
                                    <p>{incident.comment || "Không có mô tả chi tiết."}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="ihm-footer">
                    <button className="ihm-btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button className="ihm-btn-save" onClick={handleSave}>
                        <FiCheck /> Cập nhật sự vụ
                    </button>
                </div>
            </div>
        </div>
    );
}

function getStatusLabel(s) {
    return STATUS_FLOW.find(item => item.value === s)?.label || s;
}
