import React, { useState } from "react";
import { FiUserPlus, FiCheckCircle, FiXCircle, FiFileText, FiSearch } from "react-icons/fi";

const MOCK_POLICIES = [
    { id: 1, studentId: "HS015", name: "Nguyễn Trung Thực", class: "10A2", type: "Exemption (100%)", reason: "Con thương binh", status: "Approved", decisionNo: "QD-123/2026" },
    { id: 2, studentId: "HS088", name: "Lý Thị Nghèo", class: "11A4", type: "Reduction (50%)", reason: "Hộ cận nghèo", status: "Pending", decisionNo: "-" },
    { id: 3, studentId: "HS102", name: "Trần Văn Khó", class: "12A1", type: "Support", reason: "Vùng đặc biệt khó khăn", status: "Approved", decisionNo: "QD-456/2026" },
];

export default function PolicyExemptionTab() {
    const [policies, setPolicies] = useState(MOCK_POLICIES);

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <div className="fee-header-text">
                    <h3>Quản lý Miễn giảm & Chính sách Xã hội</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem'}}>
                        Theo dõi hồ sơ và phê duyệt các diện miễn học phí theo Nghị định 238/2025.
                    </p>
                </div>
                <button className="btn-primary">
                    <FiUserPlus /> Thêm hồ sơ mới
                </button>
            </div>

            <div className="fee-toolbar" style={{border: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{position: 'relative', flex: 1}}>
                        <FiSearch style={{position: 'absolute', top: '0.6rem', left: '0.5rem', color: '#94a3b8'}} />
                        <input type="text" className="fee-input" placeholder="Tìm tên HS hoặc số quyết định..." style={{paddingLeft: '1.75rem', width: '100%'}}/>
                    </div>
                    <select className="fee-select">
                        <option>Tất cả trạng thái</option>
                        <option>Đang chờ duyệt</option>
                        <option>Đã phê duyệt</option>
                    </select>
                </div>
            </div>

            <div className="fee-table-wrap">
                <table className="fee-table">
                    <thead>
                        <tr>
                            <th>Học sinh</th>
                            <th>Loại chính sách</th>
                            <th>Lý do / Căn cứ</th>
                            <th>Số quyết định</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <strong>{p.name}</strong>
                                        <span style={{fontSize: '0.75rem', color: '#64748b'}}>{p.studentId} - {p.class}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{fontWeight: 600, color: '#0369a1'}}>{p.type}</span>
                                </td>
                                <td>
                                    <span style={{fontSize: '0.85rem', color: '#475569'}}>{p.reason}</span>
                                </td>
                                <td>
                                    <code style={{background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.8rem'}}>{p.decisionNo}</code>
                                </td>
                                <td>
                                    <span className={`status-badge ${p.status.toLowerCase()}`}>
                                        {p.status === 'Approved' ? 'Đã phê duyệt' : 'Đang chờ'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        {p.status === 'Pending' ? (
                                            <>
                                                <button className="btn-icon success" title="Duyệt"><FiCheckCircle /></button>
                                                <button className="btn-icon danger" title="Từ chối"><FiXCircle /></button>
                                            </>
                                        ) : (
                                            <button className="btn-icon" title="Xem hồ sơ gốc"><FiFileText /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
