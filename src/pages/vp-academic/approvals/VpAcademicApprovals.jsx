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
            id: "REQ-2026-001",
            type: "unlock",
            title: "Yêu cầu mở khóa bảng điểm",
            desc: "Giáo viên yêu cầu mở khóa sổ điểm môn Toán lớp 10A1 để sửa điểm kiểm tra 15p do nhập sai lệch hệ số.",
            sender: "GV. Nguyễn Văn A",
            time: "15 phút trước",
            subject: "Toán Học - 10A1",
            evidence: "phuc_khao_toan_10a1.pdf",
            slaStatus: "normal"
        },
        { 
            id: "REQ-2026-002",
            type: "grade_change",
            title: "Chỉnh sửa điểm sau khi đã chốt sổ",
            desc: "Điều chỉnh điểm từ 7.5 thành 8.5 cho HS. Lê Thị D do sai sót trong quá trình cộng điểm thành phần.",
            sender: "GV. Trần Thị B",
            time: "25 giờ trước",
            subject: "Ngữ Văn - 12A2",
            evidence: "bien_ban_doi_chieu.pdf",
            slaStatus: "warning"
        },
        { 
            id: "REQ-2026-003",
            type: "unlock",
            title: "Yêu cầu mở khóa chốt học bạ",
            desc: "Cần bổ sung thành tích HSG cấp Tỉnh của HS khối 11 vào học bạ trước khi in ấn.",
            sender: "GVCN. Lê Văn C",
            time: "74 giờ trước",
            subject: "Khối 11",
            evidence: "quyet_dinh_hsg_tinh.pdf",
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
            <PageHeader
                title="Quản lý Phê Duyệt & Mở Khóa"
                eyebrow="Phó Hiệu trưởng điều hành tác nghiệp học vụ (SLA Tracking)"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="approvals-grid">
                <div className="requests-section">
                    <div className="section-header-vpa">
                        <h3>Hàng chờ yêu cầu ({requests.length})</h3>
                        <div className="sla-legend">
                            <span className="dot normal"></span> &lt; 24h
                            <span className="dot warning"></span> 24h - 72h
                            <span className="dot danger"></span> &gt; 72h
                        </div>
                    </div>

                    <div className="request-cards-vpa">
                        {requests.length === 0 ? (
                            <div className="empty-vpa">
                                <FiCheckCircle />
                                <p>Đã hoàn thành toàn bộ yêu cầu trong hàng chờ.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div className={`req-card-vpa sla-${req.slaStatus}`} key={req.id}>
                                    <div className="req-card-header">
                                        <div className="req-type">
                                            {req.type === 'unlock' ? <FiUnlock /> : <FiFileText />}
                                            <span>{req.id}</span>
                                        </div>
                                        <div className={`sla-badge ${req.slaStatus}`}>
                                            <FiClock /> {req.time}
                                            {req.slaStatus === 'danger' && <FiAlertTriangle className="pulsing" />}
                                        </div>
                                    </div>

                                    <div className="req-card-body">
                                        <h4>{req.title}</h4>
                                        <p className="req-desc">{req.desc}</p>
                                        
                                        <div className="req-info-grid">
                                            <div className="req-info-item">
                                                <FiUser /> <span>{req.sender}</span>
                                            </div>
                                            <div className="req-info-item">
                                                <FiFileText /> <span>{req.subject}</span>
                                            </div>
                                            <div className="req-info-item evidence">
                                                <FiPaperclip /> <a href="#">{req.evidence}</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="req-card-footer">
                                        <button className="btn-vpa-approve" onClick={() => handleAction(req.id, 'approve')}>
                                            <FiCheckCircle /> Duyệt & Ghi Log
                                        </button>
                                        <button className="btn-vpa-reject" onClick={() => handleAction(req.id, 'reject')}>
                                            <FiXCircle /> Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="history-section-vpa">
                    <div className="section-header-vpa">
                        <h3>Nhật ký thẩm quyền (Audit Log)</h3>
                    </div>
                    <div className="history-list-vpa">
                        {history.map(item => (
                            <div className="history-item-vpa" key={item.id}>
                                <div className={`history-status ${item.status}`}></div>
                                <div className="history-info">
                                    <strong>{item.action}</strong>
                                    <span>Đối tượng: {item.target}</span>
                                    <small>{item.time} • Bởi: {item.by}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="history-footer">
                        <FiInfo /> Nhật ký phê duyệt có hiệu lực pháp lý theo Thông tư 42.
                    </div>
                </div>
            </div>
        </div>
    );
}
