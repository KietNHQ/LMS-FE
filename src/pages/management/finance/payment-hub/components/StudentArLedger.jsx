import { useEffect, useState } from "react";
import { LoadingSpinner } from "../../../../../components/common";
import { financeService } from "../../../../../services/pages/management/finance";
import { toast } from "react-toastify";
import {
    FiDollarSign,
    FiEye,
    FiFileText,
    FiSearch,
} from "react-icons/fi";
import Modal from "../../../../../components/ui/Modal/Modal";

export default function StudentArLedger({ student, onClose }) {
    const [isLoading, setIsLoading] = useState(true);
    const [ledger, setLedger] = useState([]);
    const [summary, setSummary] = useState({ totalDebt: 0, paid: 0, remaining: 0 });
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        if (student?.id) {
            fetchStudentLedger();
        }
    }, [student]);

    const fetchStudentLedger = async () => {
        if (!student?.id || student.id.startsWith("HS")) {
            // Mock data for demo
            setLedger([]);
            setSummary({ totalDebt: 0, paid: 0, remaining: 0 });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await financeService.getStudentDebts(student.id, {
                params: { limit: 50 },
            });

            if (res?.success && res.data) {
                setLedger(res.data);
                calculateSummary(res.data);
            } else {
                setLedger([]);
            }
        } catch (error) {
            console.error("Error fetching student ledger:", error);
            setLedger([]);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateSummary = (debts) => {
        const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
        const paid = debts.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
        setSummary({
            totalDebt,
            paid,
            remaining: totalDebt - paid,
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    const getStatusBadge = (status, dueDate) => {
        const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "paid";
        if (isOverdue || status === "overdue") {
            return <span className="status-badge danger">Quá hạn</span>;
        }
        const configs = {
            paid: { label: "Đã thanh toán", color: "success" },
            partial: { label: "Một phần", color: "info" },
            unpaid: { label: "Chưa thanh toán", color: "warning" },
        };
        const config = configs[status] || configs.unpaid;
        return <span className={`status-badge ${config.color}`}>{config.label}</span>;
    };

    if (!student) return null;

    return (
        <div className="student-ar-ledger-modal">
            <div className="ledger-header">
                <h3>
                    <FiFileText /> Sổ Kế Toán - {student.name}
                </h3>
                <button className="close-btn" onClick={onClose}>Đóng</button>
            </div>

            <div className="ledger-summary">
                <div className="summary-item">
                    <span className="label">Tổng công nợ</span>
                    <span className="value">{formatCurrency(summary.totalDebt)}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Đã thanh toán</span>
                    <span className="value success">{formatCurrency(summary.paid)}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Còn phải thu</span>
                    <span className="value danger">{formatCurrency(summary.remaining)}</span>
                </div>
            </div>

            <div className="ledger-table-container">
                {isLoading ? (
                    <LoadingSpinner size="lg" label="Đang tải..." />
                ) : ledger.length === 0 ? (
                    <div className="ledger-empty">
                        <FiDollarSign size={48} />
                        <p>Chưa có công nợ nào cho học sinh này</p>
                    </div>
                ) : (
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mô tả</th>
                                <th>Ngày đến hạn</th>
                                <th>Tổng tiền</th>
                                <th>Đã trả</th>
                                <th>Còn nợ</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td className="description-cell">{item.description || "Học phí"}</td>
                                    <td>{formatDate(item.dueDate)}</td>
                                    <td className="amount">{formatCurrency(item.amount)}</td>
                                    <td className="amount success">{formatCurrency(item.paidAmount || 0)}</td>
                                    <td className="amount danger">
                                        {formatCurrency(item.amount - (item.paidAmount || 0))}
                                    </td>
                                    <td>{getStatusBadge(item.status, item.dueDate)}</td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            onClick={() => {
                                                setSelectedDebt(item);
                                                setIsDetailModalOpen(true);
                                            }}
                                        >
                                            <FiEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
