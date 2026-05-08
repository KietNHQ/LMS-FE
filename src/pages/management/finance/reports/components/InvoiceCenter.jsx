import React, { useState } from "react";
import { FiFileText, FiSend, FiCheckCircle, FiAlertCircle, FiSearch, FiRefreshCcw, FiPenTool } from "react-icons/fi";
import { toast } from "react-toastify";

const MOCK_INVOICES = [
    { id: "INV-00123", student: "Nguyễn Văn A", date: "16/10/2026", amount: 4500000, status: "signed", delivery: "sent" },
    { id: "INV-00124", student: "Trần Thị B", date: "16/10/2026", amount: 4500000, status: "draft", delivery: "not_sent" },
    { id: "INV-00125", student: "Lê Minh C", date: "15/10/2026", amount: 3500000, status: "signed", delivery: "failed" },
    { id: "INV-00126", student: "Hoàng H", date: "15/10/2026", amount: 5000000, status: "canceled", delivery: "none" },
];

const STATUS_LABELS = {
    signed: "Đã ký",
    draft: "Nháp",
    canceled: "Đã hủy",
};

const DELIVERY_LABELS = {
    sent: "Đã gửi",
    not_sent: "Chưa gửi",
    failed: "Gửi lỗi",
    none: "-",
};

export default function InvoiceCenter() {
    const [invoices] = useState(MOCK_INVOICES);

    const handleSign = () => {
        toast.info("Đang thực hiện ký số bằng Token HSM...");
        setTimeout(() => toast.success("Đã ký số thành công 5 hóa đơn hàng loạt!"), 1500);
    };

    return (
        <div className="report-panel invoice-center-panel">
            <div className="rp-header-row invoice-center__header">
                <h3 className="rp-header invoice-center__title"><FiFileText /> Trung tâm Hóa đơn điện tử (HĐĐT)</h3>
                <div className="invoice-center__actions">
                    <button className="btn-secondary invoice-action-btn" onClick={handleSign}><FiPenTool /> Ký số hàng loạt</button>
                    <button className="btn-primary invoice-action-btn"><FiSend /> Phát hành hóa đơn</button>
                </div>
            </div>

            <div className="invoice-filters invoice-center__filters">
                <div className="invoice-center__search-wrap">
                    <FiSearch className="invoice-center__search-icon" />
                    <input type="text" className="rp-select invoice-center__search" placeholder="Số hóa đơn, tên học sinh..." />
                </div>
                <select className="rp-select invoice-center__status-select">
                    <option>Trạng thái: Tất cả</option>
                    <option>Chưa ký</option>
                    <option>Đã ký</option>
                    <option>Đang chờ gửi</option>
                </select>
                <button className="btn-secondary invoice-refresh-btn" title="Làm mới danh sách"><FiRefreshCcw /></button>
            </div>

            <div className="report-table-wrap">
                <table className="report-table invoice-center__table">
                    <thead>
                        <tr>
                            <th>Số HĐ</th>
                            <th>Học sinh</th>
                            <th>Ngày xuất</th>
                            <th>Số tiền</th>
                            <th>Trạng thái HĐ</th>
                            <th>Gửi phụ huynh</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td className="invoice-id">{inv.id}</td>
                                <td>{inv.student}</td>
                                <td>{inv.date}</td>
                                <td className="invoice-amount">{inv.amount.toLocaleString("vi-VN")} ₫</td>
                                <td>
                                    <span className={`invoice-status invoice-status--${inv.status}`}>
                                        {STATUS_LABELS[inv.status]}
                                    </span>
                                </td>
                                <td>
                                    <div className={`invoice-delivery invoice-delivery--${inv.delivery}`}>
                                        {inv.delivery === "sent" && <FiCheckCircle />}
                                        {inv.delivery === "failed" && <FiAlertCircle />}
                                        {DELIVERY_LABELS[inv.delivery]}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-icon invoice-file-btn" title="Xem chi tiết hóa đơn">
                                        <FiFileText />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

