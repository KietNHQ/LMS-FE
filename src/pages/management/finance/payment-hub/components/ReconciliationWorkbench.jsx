import React, { useState } from "react";
import { FiSearch, FiRefreshCw, FiCheckCircle, FiLink, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";

const MOCK_BANK_ALERTS = [
    { id: 1, date: "16/10/2026", desc: "Nop tien hoc phi HS001 Nguyen Van A", amount: 4500000, type: "Credit", status: "Unmatched" },
    { id: 2, date: "16/10/2026", desc: "CK HOC PHI HK1 - HS002", amount: 4500000, type: "Credit", status: "Unmatched" },
    { id: 3, date: "15/10/2026", desc: "Tien an ban tru thang 10", amount: 700000, type: "Credit", status: "Unmatched" },
];

export default function ReconciliationWorkbench() {
    const [alerts, setAlerts] = useState(MOCK_BANK_ALERTS);

    const handleRefresh = () => toast.info("Đã làm mới dữ liệu đối soát (mock).")

    const handleFindStudent = (item) => toast.info(`Đang tìm học sinh phù hợp cho giao dịch ${item.id} (mock).`)

    return (
        <div className="debt-panel">
            <div className="debt-header debt-header--stacked">
                <div>
                    <h3>Đối soát Ngân hàng (VietQR / Virtual Account)</h3>
                    <p>Khớp giao dịch báo có với công nợ học sinh theo cách dễ nhìn, dễ thao tác.</p>
                </div>
                <button className="btn-secondary" onClick={handleRefresh}>
                    <FiRefreshCw /> Làm mới dữ liệu
                </button>
            </div>

            <div className="reconcile-grid">
                <div className="reconcile-section">
                    <div className="reconcile-header">
                        <FiAlertTriangle />
                        <h4>Báo có chưa đối soát</h4>
                    </div>
                    <div className="bank-alert-list">
                        {alerts.map(a => (
                            <div key={a.id} className="bank-alert-item">
                                <div className="bank-alert-head">
                                    <span className="bank-alert-date">{a.date}</span>
                                    <strong className="bank-alert-amount">+ {a.amount.toLocaleString()} ₫</strong>
                                </div>
                                <p>"{a.desc}"</p>
                                <button className="btn-action-mini" onClick={() => handleFindStudent(a)}>
                                        <FiLink /> Tìm học sinh
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="reconcile-section">
                    <div className="reconcile-header">
                        <FiCheckCircle />
                        <h4>Gợi ý khớp lệnh</h4>
                    </div>
                    <div className="match-suggestion">
                        <FiSearch />
                        <p>Chọn một giao dịch bên trái để tìm kiếm học sinh tương ứng hoặc quét mã QR tự động.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
