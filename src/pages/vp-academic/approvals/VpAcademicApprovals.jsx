import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUnlock, FiFileText, FiUser, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicApprovals.css";

export default function VpAcademicApprovals() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const [requests, setRequests] = useState([
        { 
            id: "REQ001",
            type: "unlock",
            title: "Yêu cầu mở khóa bảng điểm",
            desc: "Giáo viên yêu cầu mở khóa sổ điểm môn Toán lớp 10A1 để sửa điểm kiểm tra 15p do nhập sai lệch hệ số.",
            sender: "GV. Nguyễn Y",
            time: "15 phút trước",
            subject: "Toán Học"
        },
        { 
            id: "REQ002",
            type: "submit",
            title: "Xin phê duyệt chốt sổ điểm học kỳ",
            desc: "Lớp 12A2 đã hoàn thiện nhập điểm tất cả các môn. Xin phép Ban Giám Hiệu duyệt để khóa sổ và in điểm.",
            sender: "GVCN. Lê C",
            time: "2 giờ trước",
            subject: "Tất cả"
        }
    ]);

    const history = [
        { id: "HIS099", action: "Đã duyệt mở khóa sổ", target: "Môn Văn - 11A5", time: "Hôm qua", by: "PHT Chuyên Môn", status: "approved" },
        { id: "HIS098", action: "Đã từ chối chốt sổ", target: "Lớp 10A2", time: "Hôm qua", by: "PHT Chuyên Môn", status: "rejected" },
    ];

    const handleAction = (id, action) => {
        setRequests(requests.filter(r => r.id !== id));
        if(action === 'approve') toast.success(`Đã phê duyệt yêu cầu ${id}`);
        if(action === 'reject') toast.error(`Đã từ chối yêu cầu ${id}`);
    };

    return (
        <div className="vp-approvals">
            <PageHeader
                title="Phê Duyệt & Mở Khóa"
                eyebrow="Khung kiểm duyệt các yêu cầu về sổ điểm từ Giáo viên"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="approvals-panel">
                <div className="approvals-header">
                    <h3>Yêu Cầu Chờ Duyệt ({requests.length})</h3>
                </div>

                <div className="request-list">
                    {requests.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>Không có yêu cầu nào chờ duyệt.</div>
                    ) : (
                        requests.map(req => (
                            <div className="req-item" key={req.id}>
                                <div className={`req-icon ${req.type}`}>
                                    {req.type === 'unlock' ? <FiUnlock /> : <FiFileText />}
                                </div>
                                <div className="req-content">
                                    <h4 className="req-title">{req.title}</h4>
                                    <p className="req-desc">{req.desc}</p>
                                    <div className="req-meta">
                                        <div className="rm-item">
                                            <FiUser /> Người gửi: <strong>{req.sender}</strong>
                                        </div>
                                        <div className="rm-item">
                                            <FiClock /> Thời gian: <strong>{req.time}</strong>
                                        </div>
                                        <div className="rm-item">
                                            <FiFileText /> Áp dụng: <strong>{req.subject}</strong>
                                        </div>
                                    </div>
                                    <div className="req-actions">
                                        <button className="btn-approve" onClick={() => handleAction(req.id, 'approve')}>
                                            <FiCheckCircle /> Đồng ý / Mở khóa
                                        </button>
                                        <button className="btn-reject" onClick={() => handleAction(req.id, 'reject')}>
                                            <FiXCircle /> Từ chối
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="history-wrap">
                    <h3 style={{margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a'}}>Lịch sử phê duyệt gần đây</h3>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Thao tác</th>
                                <th>Đối tượng</th>
                                <th>Thời gian</th>
                                <th>Người duyệt</th>
                                <th>Kết quả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.id}>
                                    <td><strong>{item.action}</strong></td>
                                    <td>{item.target}</td>
                                    <td>{item.time}</td>
                                    <td>{item.by}</td>
                                    <td>
                                        <span className={`badge-status ${item.status}`}>
                                            {item.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
