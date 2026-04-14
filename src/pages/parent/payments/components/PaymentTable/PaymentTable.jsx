import React from "react";
import "./PaymentTable.css";
import { FiCheckCircle } from "react-icons/fi";
import StatusBadge from "../../../../../components/common/StatusBadge/StatusBadge";
import { formatVnd } from "../../../../../services/shared/payment/paymentShared";

export default function PaymentTable({
    payment,
    onOpenDiscount,
    onOpenPayment,
    onExportPdf,
    onOpenDetail,
}) {
    const isPaid = payment.status === "paid";

    return (
        <div className={`payment-item-card ${isPaid ? "paid" : "unpaid"}`}>
            <div className="payment-item-header">
                <div>
                    <h2>{payment.title}</h2>
                    <p>
                        {payment.childName} • {payment.className} • Han: {payment.deadlineLabel}
                    </p>
                </div>

                <div className="payment-status-wrap">
                    <StatusBadge status={payment.dueStatus.badgeStatus}>{payment.dueStatus.label}</StatusBadge>
                </div>
            </div>

            <div className="payment-breakdown-grid">
                {payment.breakdown.map((line) => (
                    <div key={line.key} className={`payment-info-box line-${line.key}`}>
                        <span>{line.label}</span>
                        <strong>{formatVnd(line.amount)}</strong>
                    </div>
                ))}
            </div>

            <div className="payment-item-footer">
                {isPaid ? (
                    <div className="paid-action-wrap">
                        <p className="paid-date"><FiCheckCircle /> Da thanh toan ngay {payment.paidDate}</p>
                        <button type="button" className="detail-btn" onClick={onOpenDetail}>
                            Xem chi tiet
                        </button>
                        <button type="button" className="export-pdf-btn" onClick={onExportPdf}>
                            Xuất file PDF
                        </button>
                    </div>
                ) : (
                    <div className="payment-action-wrap">
                        <button type="button" className="detail-btn" onClick={onOpenDetail}>
                            Xem chi tiet
                        </button>
                        <button type="button" className="discount-btn" onClick={onOpenDiscount}>
                            Nhập mã giảm giá
                        </button>
                        <button type="button" className="pay-now-btn" onClick={onOpenPayment}>
                            Thanh toán QR
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}