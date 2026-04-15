import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiAward, FiActivity, FiCheckSquare, FiFileText, FiUser, FiClock } from "react-icons/fi";
import { toast } from "react-toastify";
import "./PrincipalApprovals.css";

export default function PrincipalApprovals() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("grades");

    const [mockGrades, setMockGrades] = useState([
        { id: 1, class: "10A1", subject: "Sổ điểm HK1", requester: "PHT. Nguyễn Y", stat: "Đã kiểm tra 100% cột điểm", status: "pending", time: "2 giờ trước" },
        { id: 2, class: "11A5", subject: "Sổ điểm HK1", requester: "PHT. Nguyễn Y", stat: "Đã kiểm tra 100% cột điểm", status: "pending", time: "4 giờ trước" },
        { id: 3, class: "12A3", subject: "Học bạ định kỳ", requester: "Giáo vụ Lê C", stat: "Sẵn sàng trích xuất PDF", status: "approved", time: "Hôm qua" },
    ]);

    const [mockActivities, setMockActivities] = useState([
        { id: "A1", title: "Ngân sách Hội trại 20/11", requester: "Kế toán trưởng", date: "2,500,000,000 đ", status: "pending", time: "1 giờ trước" },
        { id: "A2", title: "Kế hoạch Bồi dưỡng Học sinh giỏi", requester: "Tổ chuyên môn Toán", date: "15/11/2026", status: "pending", time: "5 giờ trước" },
    ]);

    const handleAction = (type, id, action) => {
        if (type === 'grades') {
            setMockGrades(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
        } else {
            setMockActivities(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
        }
        toast.success(`Đã xử lý yêu cầu ${id}`);
    };

    const handleApproveAllPending = () => {
        if (activeTab === 'grades') {
            setMockGrades(prev => prev.map(item => item.status === 'pending' ? { ...item, status: 'approved' } : item));
        } else {
            setMockActivities(prev => prev.map(item => item.status === 'pending' ? { ...item, status: 'approved' } : item));
        }
        toast.success("Đã phê duyệt tất cả danh sách chờ!");
    };

    const renderStatus = (status) => {
        if (status === 'pending') return <span className="status-badge pending">⏳ Chờ duyệt</span>;
        if (status === 'approved') return <span className="status-badge approved">✅ Đã duyệt</span>;
        if (status === 'rejected') return <span className="status-badge rejected">❌ Từ chối</span>;
    };

    return (
        <div className="principal-approvals">
            <PageHeader
                title="Trung Tâm Phê Duyệt Cấp Cao"
                eyebrow="Nơi đưa ra quyết định cuối cùng cho các luồng dữ liệu & ngân sách"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="approvals-tabs">
                <button 
                    className={`approvals-tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grades')}
                >
                    <FiAward /> Phê duyệt Sổ điểm & Học bạ
                </button>
                <button 
                    className={`approvals-tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activities')}
                >
                    <FiActivity /> Phê duyệt Kế hoạch & Ngân sách
                </button>
            </div>

            <div className="approvals-content">
                <div className="approvals-header">
                    <h3>{activeTab === 'grades' ? 'Hồ sơ Chuyên môn chờ Phê duyệt' : 'Đề xuất Ngân sách / Kế hoạch hoạt động'}</h3>
                    <div className="approvals-actions">
                        <button className="btn-approve-all" onClick={handleApproveAllPending}>
                            <FiCheckSquare /> Phê duyệt Tất cả
                        </button>
                    </div>
                </div>

                <div className="approvals-table-wrap">
                    {activeTab === 'grades' ? (
                        <table className="approvals-table">
                            <thead>
                                <tr>
                                    <th>Đối tượng</th>
                                    <th>Nội dung hồ sơ</th>
                                    <th>Người đề xuất</th>
                                    <th>Thời gian</th>
                                    <th>Tình trạng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockGrades.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>Lớp {item.class}</strong></td>
                                        <td>
                                            <div style={{fontWeight: 600}}>{item.subject}</div>
                                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>{item.stat}</div>
                                        </td>
                                        <td>{item.requester}</td>
                                        <td><FiClock /> {item.time}</td>
                                        <td>{renderStatus(item.status)}</td>
                                        <td>
                                            {item.status === 'pending' && (
                                                <div className="action-btns">
                                                    <button className="btn-sm-approve" onClick={() => handleAction('grades', item.id, 'approved')}>Duyệt</button>
                                                    <button className="btn-sm-reject" onClick={() => handleAction('grades', item.id, 'rejected')}>Từ chối</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="approvals-table">
                            <thead>
                                <tr>
                                    <th>Tên Kế hoạch / Đề xuất</th>
                                    <th>Đơn vị trình ký</th>
                                    <th>Giá trị / Thời gian</th>
                                    <th>Gửi lúc</th>
                                    <th>Tình trạng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockActivities.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{fontWeight: 700}}>{item.title}</div>
                                            <div style={{fontSize: '0.8rem', color: '#2563eb'}}>#ACTIVITY_{item.id}</div>
                                        </td>
                                        <td><FiUser /> {item.requester}</td>
                                        <td style={{fontWeight: 600, color: '#166534'}}>{item.date}</td>
                                        <td>{item.time}</td>
                                        <td>{renderStatus(item.status)}</td>
                                        <td>
                                            {item.status === 'pending' && (
                                                <div className="action-btns">
                                                    <button className="btn-sm-approve" onClick={() => handleAction('activities', item.id, 'approved')}>Phê duyệt</button>
                                                    <button className="btn-sm-reject" onClick={() => handleAction('activities', item.id, 'rejected')}>Bác bỏ</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
