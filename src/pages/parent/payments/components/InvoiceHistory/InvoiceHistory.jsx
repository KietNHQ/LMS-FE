import React from "react";
import "./InvoiceHistory.css";
import StatusBadge from "../../../../../components/common/StatusBadge/StatusBadge";

export default function InvoiceHistory({ invoices }) {
    return (
        <div className="invoice-history-card">
            <div className="invoice-history-header">
                <h3>Lịch sử hóa đơn</h3>
                <p>Theo dõi các lần thanh toán trước đó</p>
            </div>

            <div className="invoice-history-table-wrapper">
                <table className="invoice-history-table">
                    <thead>
                    <tr>
                        <th>Mã hóa đơn</th>
                        <th>Học kỳ</th>
                        <th>Ngày</th>
                        <th>Số tiền</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                            <td>{invoice.invoiceCode}</td>
                            <td>{invoice.semester}</td>
                            <td>{invoice.date}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.method}</td>
                            <td>
                                <StatusBadge status={invoice.dueStatus?.badgeStatus || "default"}>
                                    {invoice.dueStatus?.label || "Chưa xác định"}
                                </StatusBadge>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}