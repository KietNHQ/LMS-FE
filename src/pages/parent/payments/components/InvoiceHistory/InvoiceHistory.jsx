import React from "react";
import "./InvoiceHistory.css";
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiCreditCard } from "react-icons/fi";

const STATUS_CONFIG = {
    paid:      { icon: <FiCheckCircle />, label: "Đã thanh toán",   cls: "status--paid" },
    unpaid:    { icon: <FiClock />,       label: "Chưa thanh toán", cls: "status--unpaid" },
    overdue:   { icon: <FiAlertCircle />, label: "Quá hạn",         cls: "status--overdue" },
    due_soon:  { icon: <FiClock />,       label: "Sắp đến hạn",     cls: "status--due-soon" },
    upcoming:  { icon: <FiClock />,       label: "Chưa đến hạn",    cls: "status--upcoming" },
    default:   { icon: <FiClock />,       label: "Chưa xác định",   cls: "status--default" },
};

function getStatusConfig(dueStatus, status) {
    if (status === "paid") return STATUS_CONFIG.paid;
    const key = dueStatus?.key;
    return STATUS_CONFIG[key] || STATUS_CONFIG[status] || STATUS_CONFIG.default;
}

export default function InvoiceHistory({ invoices }) {
    if (!invoices || invoices.length === 0) {
        return (
            <div className="ih-card">
                <div className="ih-header">
                    <div className="ih-header__left">
                        <FiFileText className="ih-header__icon" />
                        <div>
                            <h3>Lịch sử hóa đơn</h3>
                            <p>Theo dõi tất cả các khoản thanh toán học phí</p>
                        </div>
                    </div>
                </div>
                <div className="ih-empty">Chưa có hóa đơn nào.</div>
            </div>
        );
    }

    return (
        <div className="ih-card">
            <div className="ih-header">
                <div className="ih-header__left">
                    <FiFileText className="ih-header__icon" />
                    <div>
                        <h3>Lịch sử hóa đơn</h3>
                        <p>Theo dõi tất cả các khoản thanh toán học phí</p>
                    </div>
                </div>
                <span className="ih-count">{invoices.length} hóa đơn</span>
            </div>

            <div className="ih-table-wrap">
                <table className="ih-table">
                    <thead>
                        <tr>
                            <th>Mã hóa đơn</th>
                            <th>Học kỳ</th>
                            <th>Phương thức</th>
                            <th>Ngày thanh toán</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => {
                            const cfg = getStatusConfig(invoice.dueStatus, invoice.status);
                            return (
                                <tr key={invoice.id} className={`ih-row ${invoice.status === "paid" ? "ih-row--paid" : ""}`}>
                                    <td>
                                        <span className="ih-code">{invoice.invoiceCode}</span>
                                    </td>
                                    <td>
                                        <span className="ih-semester">{invoice.semester}</span>
                                    </td>
                                    <td>
                                        <div className="ih-method">
                                            <FiCreditCard className="ih-method__icon" />
                                            <span>{invoice.method}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ih-date">
                                            <FiCalendar className="ih-date__icon" />
                                            <span>{invoice.date === "--" ? "Chưa thanh toán" : invoice.date}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`ih-amount ${invoice.status === "paid" ? "ih-amount--paid" : "ih-amount--unpaid"}`}>
                                            {invoice.amount}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`ih-status ${cfg.cls}`}>
                                            {cfg.icon}
                                            {cfg.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
