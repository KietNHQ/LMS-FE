import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBell, FiAlertCircle, FiBook, FiFilter, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinancePaymentHub.css";

// Components
import StudentArLedger from "./components/StudentArLedger";
import ReconciliationWorkbench from "./components/ReconciliationWorkbench";

const AGING_BUCKETS = [
    { id: 'all', label: 'Tất cả', color: '#64748b' },
    { id: 'aging-1-7', label: '1 - 7 ngày', color: '#10b981' },
    { id: 'aging-8-30', label: '8 - 30 ngày', color: '#f59e0b' },
    { id: 'aging-31-60', label: '31 - 60 ngày', color: '#ea580c' },
    { id: 'aging-gt-60', label: '&gt; 60 ngày', color: '#dc2626' },
];

export default function FinancePaymentHub() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeBucket, setActiveBucket] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);


    const [debts, setDebts] = useState([
        { id: "HS001", name: "Nguyễn Văn X", class: "10A1", amount: "4,500,000", type: "aging-8-30", days: 15, dueDate: "01/10/2026" },
        { id: "HS005", name: "Lê Minh Y", class: "11A5", amount: "5,000,000", type: "aging-1-7", days: 3, dueDate: "18/10/2026" },
        { id: "HS012", name: "Trần H", class: "12A2", amount: "12,800,000", type: "aging-gt-60", days: 72, dueDate: "15/08/2026" },
        { id: "HS044", name: "Phạm K", class: "10A2", amount: "4,500,000", type: "aging-31-60", days: 45, dueDate: "01/09/2026" }
    ]);

    const handleRemind = (name) => {
        toast.info(`Hệ thống đã gửi thông báo tự động (Email & SMS) đến phụ huynh em ${name}`);
    };

    const filteredDebts = activeBucket === 'all' 
        ? debts 
        : debts.filter(d => d.type === activeBucket);

    return (
        <div className="fin-debt">
            <PageHeader
                title="Quản lý Công nợ & Thanh toán"
                eyebrow="Theo dõi và truy thu các khoản phí trễ hạn từ học sinh"
                actions={
                    <div style={{display: 'flex', gap: '0.75rem'}}>
                        <button className="btn-secondary"><FiDownload /> Xuất báo cáo nợ (S12-H)</button>
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    </div>
                }
            />

            <div className="debt-panel">
                <div className="debt-header">
                    <div>
                        <h3>Sổ theo dõi công nợ học sinh</h3>
                        <div className="aging-filters" style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                            <FiFilter style={{color: '#94a3b8', marginRight: '0.5rem'}} />
                            {AGING_BUCKETS.map(b => (
                                <button 
                                    key={b.id} 
                                    className={`btn-tag ${activeBucket === b.id ? 'active' : ''}`}
                                    onClick={() => setActiveBucket(b.id)}
                                    style={{
                                        padding: '0.3rem 0.75rem', 
                                        borderRadius: '2rem', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600,
                                        border: '1px solid',
                                        cursor: 'pointer',
                                        background: activeBucket === b.id ? b.color : '#fff',
                                        color: activeBucket === b.id ? '#fff' : b.color,
                                        borderColor: b.color
                                    }}
                                >
                                    {b.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <button className="btn-remind" style={{padding: '0.6rem 1rem', fontSize: '0.85rem'}}>
                            <FiBell /> Nhắc nợ đồng loạt
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
                                <th>Tuổi nợ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDebts.map(d => (
                                <tr key={d.id} className={`debt-row ${d.type}`}>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <strong>{d.name}</strong>
                                            <span style={{fontSize: '0.75rem', color: '#64748b'}}>{d.id}</span>
                                        </div>
                                    </td>
                                    <td>{d.class}</td>
                                    <td className="debt-amt">{d.amount} ₫</td>
                                    <td>{d.dueDate}</td>
                                    <td>
                                        <span style={{display:'inline-flex', alignItems:'center', gap:'0.3rem', fontWeight:600, color: '#1e293b'}}>
                                            <FiAlertCircle /> 
                                            Trễ {d.days} ngày
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button className="btn-secondary" style={{fontSize: '0.75rem'}} onClick={() => setSelectedStudent(d)}>
                                                <FiBook /> Xem Sổ Cái
                                            </button>
                                            <button className={`btn-remind ${d.days < 30 ? 'yellow' : ''}`} onClick={() => handleRemind(d.name)}>
                                                <FiBell /> Nhắc nợ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reconciliation Workbench */}
            <ReconciliationWorkbench />

            {/* Student Ledger Drawer */}
            <StudentArLedger 
                student={selectedStudent} 
                onClose={() => setSelectedStudent(null)} 
            />
        </div>
    );
}

