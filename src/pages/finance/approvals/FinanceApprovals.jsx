import React from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiCheck, FiX, FiClipboard, FiAlertCircle, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-toastify";

const MOCK_REQUESTS = [
    { id: 1, type: "Refund Request", requester: "Thu ngân Phạm K", detail: "Học sinh thôi học, hoàn trả phí bán trú", amount: 1200000, date: "16/10/2026", status: "Pending" },
    { id: 2, type: "Manual Discount", requester: "Kế toán Lê Thị M", detail: "Giảm 50% phí đồng phục (Gia cảnh khó khăn)", amount: 450000, date: "16/10/2026", status: "Pending" },
    { id: 3, type: "Debt Write-off", requester: "Head Accountant", detail: "Khoản nợ khó đòi niên độ 2023", amount: 500000, date: "15/10/2026", status: "Pending" },
];

export default function FinanceApprovals() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const handleAction = (id, type) => {
        toast.success(`${type === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối'} yêu cầu #${id} thành công.`);
    };

    return (
        <div className="fin-approvals" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Quản Lý Phê Duyệt"
                eyebrow="Hộp thư chờ xử lý các nghiệp vụ tài chính nhạy cảm"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="approval-grid" style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem'}}>
                <div className="approval-list">
                    {MOCK_REQUESTS.map(req => (
                        <div key={req.id} className="report-panel" style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{display: 'flex', gap: '1.25rem', alignItems: 'center'}}>
                                <div style={{background: '#eff6ff', color: '#2563eb', padding: '1rem', borderRadius: '0.5rem', fontSize: '1.5rem'}}><FiClipboard /></div>
                                <div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem'}}>
                                        <strong style={{fontSize: '1rem'}}>{req.type}</strong>
                                        <span style={{fontSize: '0.75rem', color: '#64748b'}}>{req.date}</span>
                                    </div>
                                    <p style={{fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem'}}>{req.detail}</p>
                                    <div style={{fontSize: '0.85rem'}}>Người yêu cầu: <strong>{req.requester}</strong> • Số tiền: <strong style={{color: '#2563eb'}}>{req.amount.toLocaleString()} ₫</strong></div>
                                </div>
                            </div>
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                <button className="btn-secondary" style={{color: '#dc2626', borderColor: '#fecaca'}} onClick={() => handleAction(req.id, 'reject')}><FiX /> Từ chối</button>
                                <button className="btn-primary" onClick={() => handleAction(req.id, 'approve')}><FiCheck /> Phê duyệt</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="approval-sidebar">
                    <div className="report-panel" style={{position: 'sticky', top: '1rem'}}>
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}><FiAlertCircle style={{color: '#f59e0b'}}/> Chính sách phê duyệt</h4>
                        <div style={{fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5}}>
                            <p>Mọi nghiệp vụ hoàn tiền (Refund) trên 1,000,000đ yêu cầu phê duyệt từ **Hiệu trưởng**.</p>
                            <br/>
                            <p>Các nghiệp vụ miễn giảm ngoài định mức yêu cầu đính kèm biên bản họp hội đồng.</p>
                        </div>
                        <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0'}}/>
                        <button className="btn-secondary" style={{width: '100%'}}><FiMessageSquare /> Gửi tin nhắn nội bộ</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
