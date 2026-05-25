import { useEffect, useState } from "react";
import { LoadingSpinner } from "../../../../../components/common";
import { financeService } from "../../../../../services/pages/management/finance";
import { toast } from "react-toastify";
import {
    FiCheck,
    FiClock,
    FiDollarSign,
    FiRefreshCw,
    FiSearch,
    FiX,
} from "react-icons/fi";

export default function ReconciliationWorkbench({ debts = [] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [matched, setMatched] = useState([]);
    const [unmatched, setUnmatched] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        processReconciliation();
    }, [debts]);

    const processReconciliation = () => {
        // Filter debts that are paid vs unpaid
        const paidDebts = debts.filter(d => d.status === "paid" || d.paidAmount > 0);
        const unpaidDebts = debts.filter(d => d.status !== "paid" && (!d.paidAmount || d.paidAmount < d.amount));
        
        setMatched(paidDebts);
        setUnmatched(unpaidDebts);
    };

    const handleMatch = async (debtId) => {
        try {
            await financeService.updateDebt(debtId, { body: { status: "reconciled" } });
            toast.success("Đã đối soát thành công");
        } catch (error) {
            toast.error("Có lỗi khi đối soát");
        }
    };

    const handleAutoMatch = async () => {
        if (unmatched.length === 0) {
            toast.info("Không có công nợ nào cần đối soát");
            return;
        }
        setIsLoading(true);
        toast.info(`Đang đối soát ${unmatched.length} công nợ...`);
        let success = 0;
        let failed = 0;
        for (const debt of unmatched) {
            try {
                await financeService.updateDebt(debt.id, { body: { status: "reconciled" } });
                success++;
            } catch (e) {
                failed++;
            }
        }
        setIsLoading(false);
        if (failed === 0) {
            toast.success(`Hoàn tất đối soát ${success} công nợ`);
        } else {
            toast.warning(`Đã đối soát ${success} công nợ, ${failed} thất bại`);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const filteredUnmatched = unmatched.filter(d =>
        !searchTerm ||
        (d.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.studentCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="reconcile-panel">
            <div className="reconcile-header">
                <h3>Bảng đối soát</h3>
                <div className="reconcile-actions">
                    <button className="btn-secondary" onClick={() => window.location.reload()}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-remind" onClick={handleAutoMatch}>
                        <FiCheck /> Tự động đối soát
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="reconcile-stats">
                <div className="reconcile-stat">
                    <FiDollarSign />
                    <div>
                        <strong>{matched.length}</strong>
                        <span>Đã đối soát</span>
                    </div>
                </div>
                <div className="reconcile-stat warning">
                    <FiClock />
                    <div>
                        <strong>{unmatched.length}</strong>
                        <span>Chưa đối soát</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="reconcile-search">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Tìm HS, mã giao dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Unmatched List */}
            <div className="reconcile-list">
                <h4>Công nợ chưa đối soát ({filteredUnmatched.length})</h4>
                {isLoading ? (
                    <LoadingSpinner size="lg" label="Đang xử lý..." />
                ) : filteredUnmatched.length === 0 ? (
                    <div className="reconcile-empty">
                        <FiCheck size={48} />
                        <p>Tất cả công nợ đã được đối soát</p>
                    </div>
                ) : (
                    <div className="reconcile-items">
                        {filteredUnmatched.map(item => (
                            <div key={item.id} className="reconcile-item">
                                <div className="reconcile-item-info">
                                    <strong>{item.studentName}</strong>
                                    <span>{item.studentCode} • {item.className}</span>
                                    <span className="reconcile-amount">{formatCurrency(item.amount)}</span>
                                </div>
                                <div className="reconcile-item-actions">
                                    <button
                                        className="btn-remind"
                                        onClick={() => handleMatch(item.id)}
                                    >
                                        <FiCheck /> Đối soát
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
