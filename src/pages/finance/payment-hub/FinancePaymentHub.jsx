import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBell, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinancePaymentHub.css";

export default function FinancePaymentHub() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const [debts, setDebts] = useState([
        { id: 1, name: "Nguyễn Văn X", class: "10A1", amount: "4,500,000", type: "overdue", days: 15, dueDate: "01/10/2026" },
        { id: 2, name: "Lê Minh Y", class: "11A5", amount: "5,000,000", type: "near-due", days: -3, dueDate: "18/10/2026" },
        { id: 3, name: "Trần H", class: "12A2", amount: "4,800,000", type: "overdue", days: 30, dueDate: "15/09/2026" },
        { id: 4, name: "Phạm K", class: "10A2", amount: "4,500,000", type: "near-due", days: -1, dueDate: "16/10/2026" }
    ]);

    const handleRemind = (name) => {
        toast.info(`Hệ thống đã gửi thông báo tự động (Email & SMS) đến phụ huynh em ${name}`);
    };

    return (
        <div className="fin-debt">
            <PageHeader
                title="Quản Lý Công Nợ"
                eyebrow="Theo dõi và truy thu các khoản phí trễ hạn từ học sinh"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="debt-panel">
                <div className="debt-header">
                    <h3>Danh sách nợ xấu / Gần đến hạn</h3>
                    <div>
                        <button className="btn-remind" style={{padding: '0.6rem 1rem', fontSize: '0.85rem'}}>
                            <FiBell /> Nhắc nợ toàn bộ danh sách
                        </button>
                    </div>
                </div>

                <div className="debt-table-wrap">
                    <table className="debt-table">
                        <thead>
                            <tr>
                                <th>Học sinh</th>
                                <th>Lớp</th>
                                <th>Số tiền nợ (VNĐ)</th>
                                <th>Hạn chót</th>
                                <th>Tình trạng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {debts.map(d => (
                                <tr key={d.id} className={`debt-row ${d.type}`}>
                                    <td><strong>{d.name}</strong></td>
                                    <td>{d.class}</td>
                                    <td className="debt-amt">{d.amount} ₫</td>
                                    <td>{d.dueDate}</td>
                                    <td>
                                        <span style={{display:'inline-flex', alignItems:'center', gap:'0.3rem', fontWeight:600, color: d.type === 'overdue' ? '#dc2626' : '#d97706'}}>
                                            <FiAlertCircle /> 
                                            {d.type === 'overdue' ? `Trễ ${d.days} ngày` : `Còn ${Math.abs(d.days)} ngày`}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={`btn-remind ${d.type === 'near-due' ? 'yellow' : ''}`} onClick={() => handleRemind(d.name)}>
                                            <FiBell /> Gửi trát nhắc nợ
                                        </button>
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
