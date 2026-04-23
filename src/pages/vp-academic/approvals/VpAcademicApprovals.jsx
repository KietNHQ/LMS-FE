import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiUnlock, FiFileText, FiUser, FiClock, 
    FiCheckCircle, FiXCircle, FiPaperclip, FiInfo, FiAlertTriangle 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicApprovals.css";

export default function VpAcademicApprovals() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const [requests, setRequests] = useState([
        { 
            id: "APR-2026-001",
            type: "exam",
            title: "03 Đề thi HK2 chờ duyệt nội dung",
            desc: "Đề thi chính thức môn Toán, Văn, Anh khối 12 đã hoàn thiện. Cần PHT kiểm duyệt nội dung và tính bảo mật trước khi in ấn.",
            sender: "Nguyễn Văn A",
            role: "Tổ trưởng",
            time: "15 phút trước",
            subject: "Tổ Toán - Văn",
            evidence: "de_thi_hk2_toan_van.zip",
            slaStatus: "normal"
        },
        { 
            id: "APR-2026-002",
            type: "grade_change",
            title: "12 yêu cầu sửa điểm sau khóa sổ",
            desc: "Giáo viên khối 10 yêu cầu điều chỉnh sai sót nhập liệu sau khi hệ thống đã khóa dữ liệu định kỳ.",
            sender: "Hệ thống tổng hợp",
            role: "Admin",
            time: "3 giờ trước",
            subject: "Khối 10",
            evidence: "danh_sach_sua_diem.xlsx",
            slaStatus: "warning"
        },
        { 
            id: "APR-2026-003",
            type: "unlock",
            title: "Yêu cầu mở khóa học bạ lớp 11A5",
            desc: "Cần bổ sung thành tích HSG cấp Tỉnh cho 05 học sinh trước khi chốt dữ liệu năm học.",
            sender: "Lê Văn C",
            role: "GVCN",
            time: "74 giờ trước",
            subject: "Lớp 11A5",
            evidence: "quyet_dinh_hsg.pdf",
            slaStatus: "danger"
        }
    ]);

    const history = [
        { id: "HIS099", action: "Đã duyệt mở khóa sổ", target: "Môn Văn - 11A5", time: "Hôm qua", by: "PHT. Minh (approved_as_vp)", status: "approved" },
        { id: "HIS098", action: "Đã từ chối chốt sổ", target: "Lớp 10A2", time: "Hôm qua", by: "PHT. Minh (approved_as_vp)", status: "rejected" },
    ];

    const handleAction = (id, action) => {
        setRequests(requests.filter(r => r.id !== id));
        if(action === 'approve') toast.success(`Đã phê duyệt yêu cầu ${id} và lưu nhật ký hệ thống.`);
        if(action === 'reject') toast.error(`Đã từ chối yêu cầu ${id}.`);
    };

    return (
        <div className="vp-approvals-premium">
            {/* Header Section */}
            <div className="vpa-custom-header">
                <div className="vpa-header-left">
                    <h1>Quản lý Phê Duyệt & Mở Khóa</h1>
                </div>
                <div className="vpa-header-right">
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                        className="vpa-selector-override"
                    />
                </div>
            </div>

            <div className="approvals-grid">
                <div className="requests-section">
                    <div className="section-header-vpa">
                        <div className="sh-left">
                            <FiFileText className="sh-icon" />
                            <h3>Hàng chờ yêu cầu ({requests.length})</h3>
                        </div>
                        <div className="sla-legend">
                            <span className="dot normal"></span> &lt; 24h
                            <span className="dot warning"></span> 24h - 72h
                            <span className="dot danger"></span> &gt; 72h
                        </div>
                    </div>

                    <div className="request-cards-vpa">
                        {requests.length === 0 ? (
                            <div className="empty-vpa">
                                <div className="empty-icon-wrapper">
                                    <FiCheckCircle />
                                </div>
                                <h4>Tuyệt vời!</h4>
                                <p>Đã hoàn thành toàn bộ yêu cầu trong hàng chờ.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div className={`req-card-vpa sla-${req.slaStatus}`} key={req.id}>
                                    <div className="req-card-header">
                                        <div className="req-id">
                                            {req.type === 'unlock' ? <FiUnlock /> : <FiFileText />}
                                            <span>{req.id}</span>
                                        </div>
                                        <div className={`sla-timer ${req.slaStatus}`}>
                                            <FiClock /> {req.time}
                                        </div>
                                    </div>

                                    <div className="req-card-body">
                                        <h4>{req.title}</h4>
                                        <p className="req-desc">{req.desc}</p>
                                        
                                        <div className="req-info-grid">
                                            <div className="info-col">
                                                <div className="info-item">
                                                    <FiUser className="item-icon" />
                                                    <div className="item-content">
                                                        <span>{req.role}</span>
                                                        <strong>{req.sender}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="info-col">
                                                <div className="info-item">
                                                    <FiFileText className="item-icon" />
                                                    <div className="item-content">
                                                        <span>Đơn vị</span>
                                                        <strong>{req.subject}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="info-col">
                                                <div className="info-item evidence">
                                                    <FiPaperclip className="item-icon" />
                                                    <div className="item-content">
                                                        <span>Tệp đính kèm</span>
                                                        <a href="#">{req.evidence}</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="req-card-actions">
                                        <button className="btn-approve-log" onClick={() => handleAction(req.id, 'approve')}>
                                            <FiCheckCircle /> Duyệt & Ghi Log
                                        </button>
                                        <button className="btn-reject" onClick={() => handleAction(req.id, 'reject')}>
                                            <FiXCircle /> Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="history-sidebar">
                    <div className="sidebar-header">
                        <h3>Nhật ký thẩm quyền (Audit Log)</h3>
                    </div>
                    <div className="history-timeline">
                        {history.map(item => (
                            <div className="timeline-item" key={item.id}>
                                <div className={`timeline-indicator ${item.status}`}></div>
                                <div className="timeline-content">
                                    <div className="content-main">
                                        <strong>{item.action}</strong>
                                        <span className="target">Đối tượng: {item.target}</span>
                                    </div>
                                    <div className="content-meta">
                                        {item.time} • Bởi: {item.by}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="history-footer">
                            <FiInfo /> Nhật ký phê duyệt có hiệu lực pháp lý theo Thông tư 42.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
