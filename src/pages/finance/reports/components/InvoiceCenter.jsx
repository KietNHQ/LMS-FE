import React, { useState } from "react";
import { FiFileText, FiSend, FiCheckCircle, FiAlertCircle, FiSearch, FiRefreshCcw, FiPenTool } from "react-icons/fi";
import { toast } from "react-toastify";

const MOCK_INVOICES = [
    { id: "INV-00123", student: "Nguyễn Văn A", date: "16/10/2026", amount: 4500000, status: "Signed", delivery: "Sent" },
    { id: "INV-00124", student: "Trần Thị B", date: "16/10/2026", amount: 4500000, status: "Draft", delivery: "Not Sent" },
    { id: "INV-00125", student: "Lê Minh C", date: "15/10/2026", amount: 3500000, status: "Signed", delivery: "Failed" },
    { id: "INV-00126", student: "Hoàng H", date: "15/10/2026", amount: 5000000, status: "Canceled", delivery: "-" },
];

export default function InvoiceCenter() {
    const [invoices, setInvoices] = useState(MOCK_INVOICES);

    const handleSign = () => {
        toast.info("Đang thực hiện ký số bằng Token HSM...");
        setTimeout(() => toast.success("Đã ký số thành công 5 hóa đơn hàng loạt!"), 1500);
    };

    return (
        <div className="report-panel" style={{marginTop: '2rem'}}>
            <div className="rp-header-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3 className="rp-header" style={{margin: 0}}><FiFileText /> Trung tâm Hóa đơn điện tử (HĐĐT)</h3>
                <div style={{display: 'flex', gap: '0.75rem'}}>
                    <button className="btn-secondary" onClick={handleSign}><FiPenTool /> Ký số hàng loạt</button>
                    <button className="btn-primary"><FiSend /> Phát hành hóa đơn</button>
                </div>
            </div>

            <div className="invoice-filters" style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem'}}>
                <div style={{position: 'relative', flex: 1}}>
                    <FiSearch style={{position: 'absolute', top: '0.6rem', left: '0.5rem', color: '#94a3b8'}} />
                    <input type="text" className="rp-select" placeholder="Số hóa đơn, tên học sinh..." style={{paddingLeft: '1.75rem', width: '100%', background: '#fff'}}/>
                </div>
                <select className="rp-select" style={{background: '#fff'}}>
                    <option>Trạng thái: Tất cả</option>
                    <option>Chưa ký</option>
                    <option>Đã ký</option>
                    <option>Đang chờ gởi</option>
                </select>
                <button className="btn-secondary" style={{width: 'auto'}}><FiRefreshCcw /></button>
            </div>

            <div className="report-table-wrap">
                <table className="report-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr style={{textAlign: 'left', background: '#f1f5f9'}}>
                            <th style={{padding: '0.75rem 1rem'}}>Số HĐ</th>
                            <th style={{padding: '0.75rem 1rem'}}>Học sinh</th>
                            <th style={{padding: '0.75rem 1rem'}}>Ngày xuất</th>
                            <th style={{padding: '0.75rem 1rem'}}>Số tiền</th>
                            <th style={{padding: '0.75rem 1rem'}}>Trạng thái HĐ</th>
                            <th style={{padding: '0.75rem 1rem'}}>Gửi Phụ huynh</th>
                            <th style={{padding: '0.75rem 1rem'}}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                                <td style={{padding: '1rem', fontWeight: 600, color: '#2563eb'}}>{inv.id}</td>
                                <td style={{padding: '1rem'}}>{inv.student}</td>
                                <td style={{padding: '1rem'}}>{inv.date}</td>
                                <td style={{padding: '1rem', fontWeight: 600}}>{inv.amount.toLocaleString()} ₫</td>
                                <td style={{padding: '1rem'}}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '0.25rem', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600,
                                        background: inv.status === 'Signed' ? '#f3e8ff' : (inv.status === 'Draft' ? '#f1f5f9' : '#fee2e2'),
                                        color: inv.status === 'Signed' ? '#7e22ce' : (inv.status === 'Draft' ? '#475569' : '#991b1b')
                                    }}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td style={{padding: '1rem'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem'}}>
                                        {inv.delivery === 'Sent' ? <FiCheckCircle style={{color: '#10b981'}} /> : (inv.delivery === 'Failed' ? <FiAlertCircle style={{color: '#dc2626'}} /> : null)}
                                        {inv.delivery}
                                    </div>
                                </td>
                                <td style={{padding: '1rem'}}>
                                    <button className="btn-icon" style={{border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '1.1rem'}}><FiFileText /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
