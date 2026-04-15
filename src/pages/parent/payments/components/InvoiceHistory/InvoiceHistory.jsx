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

            <div className="invoice-history-list">
                {invoices.map((invoice) => (
                    <article key={invoice.id} className="invoice-history-item">
                        <div className="invoice-history-item__top">
                            <div className="invoice-history-item__code">{invoice.invoiceCode}</div>
                            <StatusBadge status={invoice.dueStatus?.badgeStatus || "default"}>
                                {invoice.dueStatus?.label || "Chưa xác định"}
                            </StatusBadge>
                        </div>

                        <div className="invoice-history-item__meta">
                            <span>{invoice.semester}</span>
                            <span>Ngay: {invoice.date}</span>
                            <span>{invoice.method}</span>
                        </div>

                        <div className="invoice-history-item__amount">{invoice.amount}</div>
                    </article>
                ))}
            </div>
        </div>
    );
}