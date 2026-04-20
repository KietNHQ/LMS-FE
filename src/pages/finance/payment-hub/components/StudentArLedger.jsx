import React from "react";
import { FiX, FiArrowDown, FiArrowUp, FiFileText, FiCalendar, FiClock } from "react-icons/fi";

const MOCK_LEDGER = [
    { id: 101, date: "01/09/2026", type: "Opening Balance", ref: "-", amount: 0, balance: 0 },
    { id: 102, date: "05/09/2026", type: "Charge (Mass Batch)", ref: "INV-001", amount: 4500000, balance: 4500000 },
    { id: 103, date: "10/09/2026", type: "Exemption Approval", ref: "QD-123", amount: -1000000, balance: 3500000 },
    { id: 104, date: "15/10/2026", type: "Payment (VietQR)", ref: "RCT-999", amount: -3500000, balance: 0 },
];

export default function StudentArLedger({ student, onClose }) {
    if (!student) return null;

    return (
        <div className="ledger-drawer-overlay" onClick={onClose}>
            <div className="ledger-drawer" onClick={e => e.stopPropagation()}>
                <div className="ledger-header">
                    <div>
                        <h3>Sổ cái chi tiết học sinh</h3>
                        <p>{student.name} ({student.id}) - Lớp {student.class}</p>
                    </div>
                    <button className="btn-close-drawer" onClick={onClose}><FiX /></button>
                </div>

                <div className="ledger-summary-grid">
                    <div className="summary-item">
                        <span>Số dư đầu kỳ</span>
                        <strong>0 ₫</strong>
                    </div>
                    <div className="summary-item">
                        <span>Tổng phát sinh</span>
                        <strong style={{color: '#2563eb'}}>+ 4,500,000 ₫</strong>
                    </div>
                    <div className="summary-item">
                        <span>Tổng đã giảm/nộp</span>
                        <strong style={{color: '#10b981'}}>- 4,500,000 ₫</strong>
                    </div>
                    <div className="summary-item highlight">
                        <span>Số dư hiện tại</span>
                        <strong style={{fontSize: '1.25rem'}}>0 ₫</strong>
                    </div>
                </div>

                <div className="ledger-timeline">
                    <h4>Lịch sử giao dịch (Audit Trail)</h4>
                    <div className="timeline-list">
                        {MOCK_LEDGER.map((entry, index) => (
                            <div key={entry.id} className="timeline-item">
                                <div className="timeline-marker">
                                    <div className="marker-dot"></div>
                                    {index < MOCK_LEDGER.length - 1 && <div className="marker-line"></div>}
                                </div>
                                <div className="timeline-content">
                                    <div className="t-header">
                                        <span className="t-date"><FiCalendar /> {entry.date}</span>
                                        <span className={`t-badge ${entry.amount > 0 ? 'debit' : (entry.amount < 0 ? 'credit' : 'neutral')}`}>
                                            {entry.amount > 0 ? <FiArrowUp /> : <FiArrowDown />}
                                            {entry.amount !== 0 ? Math.abs(entry.amount).toLocaleString() : 0} ₫
                                        </span>
                                    </div>
                                    <div className="t-body">
                                        <strong>{entry.type}</strong>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem'}}>
                                            <span style={{fontSize: '0.8rem', color: '#64748b'}}>Chứng từ: {entry.ref}</span>
                                            <span style={{fontSize: '0.85rem', fontWeight: 600}}>Dư: {entry.balance.toLocaleString()} ₫</span>
                                        </div>
                                    </div>
                                    {entry.ref !== '-' && (
                                        <button className="btn-view-doc">
                                            <FiFileText /> Xem chứng từ gốc
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ledger-footer">
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <FiFileText /> Xuất Sổ chi tiết (PDF)
                    </button>
                    <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center'}}>
                        <FiClock /> Dữ liệu được cập nhật thời gian thực từ hệ thống kế toán.
                    </p>
                </div>
            </div>
        </div>
    );
}
