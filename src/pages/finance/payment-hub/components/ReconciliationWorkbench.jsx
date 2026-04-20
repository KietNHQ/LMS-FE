import React, { useState } from "react";
import { FiSearch, FiRefreshCw, FiCheckCircle, FiLink, FiAlertTriangle } from "react-icons/fi";

const MOCK_BANK_ALERTS = [
    { id: 1, date: "16/10/2026", desc: "Nop tien hoc phi HS001 Nguyen Van A", amount: 4500000, type: "Credit", status: "Unmatched" },
    { id: 2, date: "16/10/2026", desc: "CK HOC PHI HK1 - HS002", amount: 4500000, type: "Credit", status: "Unmatched" },
    { id: 3, date: "15/10/2026", desc: "Tien an ban tru thang 10", amount: 700000, type: "Credit", status: "Unmatched" },
];

export default function ReconciliationWorkbench() {
    const [alerts, setAlerts] = useState(MOCK_BANK_ALERTS);

    return (
        <div className="debt-panel" style={{marginTop: '2rem'}}>
            <div className="debt-header">
                <div>
                    <h3>Đối soát Ngân hàng (VietQR / Virtual Account)</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b'}}>Khớp các giao dịch báo có từ ngân hàng với công nợ học sinh.</p>
                </div>
                <button className="btn-secondary">
                    <FiRefreshCw /> Làm mới dữ liệu
                </button>
            </div>

            <div className="reconcile-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem'}}>
                {/* Left: Unmatched Alerts */}
                <div className="reconcile-section">
                    <h4 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <FiAlertTriangle style={{color: '#f59e0b'}} /> Báo có chưa đối soát
                    </h4>
                    <div className="bank-alert-list" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                        {alerts.map(a => (
                            <div key={a.id} className="bank-alert-item" style={{background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                    <span style={{fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6'}}>{a.date}</span>
                                    <strong style={{color: '#16a34a'}}>+ {a.amount.toLocaleString()} ₫</strong>
                                </div>
                                <p style={{fontSize: '0.85rem', margin: '0.25rem 0', fontStyle: 'italic'}}>"{a.desc}"</p>
                                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem'}}>
                                    <button className="btn-action-mini" style={{color: '#2563eb', border: '1px solid #bfdbfe', background: '#eff6ff'}}>
                                        <FiLink /> Tìm học sinh
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Auto-Match Suggestion */}
                <div className="reconcile-section">
                    <h4 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <FiCheckCircle style={{color: '#10b981'}} /> Gợi ý khớp lệnh (AI Match)
                    </h4>
                    <div className="match-suggestion" style={{padding: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '0.75rem', color: '#94a3b8'}}>
                        <FiSearch style={{fontSize: '2rem', marginBottom: '1rem'}} />
                        <p>Chọn một giao dịch bên trái để tìm kiếm học sinh tương ứng hoặc quét mã QR tự động.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
