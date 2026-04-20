import React from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiSearch, FiClock, FiUser, FiActivity, FiArrowRight } from "react-icons/fi";

const MOCK_LOGS = [
    { id: 1, time: "16/10/2026 14:20:15", user: "Kế toán Lê Thị M", action: "Deleted Receipt", docId: "RCT-772", reason: "Sai thông tin học sinh", severity: 'high' },
    { id: 2, time: "16/10/2026 11:05:42", user: "Admin", action: "Update Fee Policy", docId: "HP_CHINH", reason: "Cập nhật đơn giá HK2", severity: 'medium' },
    { id: 3, time: "15/10/2026 09:30:00", user: "Thu ngân Phạm K", action: "Override Exemption", docId: "HS-001", reason: "Điều chỉnh theo quyết định mới", severity: 'high' },
    { id: 4, time: "14/10/2026 16:50:11", user: "Kế toán Lê Thị M", action: "Signed Invoice", docId: "INV-552", reason: "Phát hành định kỳ", severity: 'low' },
];

export default function FinanceAuditLog() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    return (
        <div className="fin-audit" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Nhật Ký Kiểm Toán (Audit Trail)"
                eyebrow="Truy xuất lịch sử thay đổi dữ liệu tài chính phục vụ kiểm soát nội bộ"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="report-panel">
                <div className="audit-filters" style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                    <div style={{position: 'relative', flex: 1}}>
                        <FiSearch style={{position: 'absolute', top: '0.6rem', left: '0.5rem', color: '#94a3b8'}} />
                        <input type="text" className="rp-select" placeholder="Tìm theo nhân viên, mã chứng từ hoặc hành động..." style={{paddingLeft: '1.75rem', width: '100%', background: '#f8fafc'}}/>
                    </div>
                </div>

                <div className="report-table-wrap">
                    <table className="report-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{textAlign: 'left', background: '#f1f5f9'}}>
                                <th style={{padding: '0.75rem 1rem'}}>Thời gian</th>
                                <th style={{padding: '0.75rem 1rem'}}>Nhân viên</th>
                                <th style={{padding: '0.75rem 1rem'}}>Hành động</th>
                                <th style={{padding: '0.75rem 1rem'}}>Mã đối tượng</th>
                                <th style={{padding: '0.75rem 1rem'}}>Lý do / Mô tả</th>
                                <th style={{padding: '0.75rem 1rem'}}>Mức độ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_LOGS.map(log => (
                                <tr key={log.id} style={{borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem'}}>
                                    <td style={{padding: '1rem', color: '#64748b'}}><FiClock /> {log.time}</td>
                                    <td style={{padding: '1rem'}}><FiUser style={{marginRight: '0.4rem'}}/> {log.user}</td>
                                    <td style={{padding: '1rem'}}><strong>{log.action}</strong></td>
                                    <td style={{padding: '1rem'}}><code style={{background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem'}}>{log.docId}</code></td>
                                    <td style={{padding: '1rem', color: '#475569'}}>{log.reason}</td>
                                    <td style={{padding: '1rem'}}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '2rem', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700,
                                            background: log.severity === 'high' ? '#fee2e2' : (log.severity === 'medium' ? '#fff7ed' : '#f0fdf4'),
                                            color: log.severity === 'high' ? '#991b1b' : (log.severity === 'medium' ? '#9a3412' : '#166534')
                                        }}>
                                            {log.severity.toUpperCase()}
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
