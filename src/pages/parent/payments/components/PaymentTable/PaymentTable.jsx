import React, { useMemo } from "react";
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
    const remainingAmount = useMemo(
        () => payment.breakdown.find((line) => line.key === "remaining")?.amount ?? payment.finalAmount,
        [payment.breakdown, payment.finalAmount]
    );
    const paidAmount = useMemo(
        () => payment.breakdown.find((line) => line.key === "paid")?.amount ?? payment.paidAmount,
        [payment.breakdown, payment.paidAmount]
    );
    const compactAmountLabel = isPaid ? "Da thanh toan" : "Con lai";
    const compactAmount = isPaid ? paidAmount : remainingAmount;
    const handleCardKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDetail();
        }
    };

    const withStop = (handler) => (event) => {
        event.stopPropagation();
        handler();
    };

    return (
        <div
            className={`payment-item-card ${isPaid ? "paid" : "unpaid"}`}
            role="button"
            tabIndex={0}
            onClick={onOpenDetail}
            onKeyDown={handleCardKeyDown}
        >
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

            <div className="payment-item-compact-footer">
                <div className="payment-item-compact-amount">
                    <span>{compactAmountLabel}</span>
                    <strong>{formatVnd(compactAmount)}</strong>
                </div>
            </div>

            <div className="payment-item-footer">
                {isPaid ? (
                    <div className="paid-action-wrap">
                        <p className="paid-date"><FiCheckCircle /> Da thanh toan ngay {payment.paidDate}</p>
                        <button type="button" className="detail-btn" onClick={withStop(onOpenDetail)}>
                            Xem chi tiet
                        </button>
                        <button type="button" className="export-pdf-btn" onClick={withStop(onExportPdf)}>
                            Xuất file PDF
                        </button>
                    </div>
                ) : (
                    <div className="payment-action-wrap">
                        <button type="button" className="detail-btn" onClick={withStop(onOpenDetail)}>
                            Xem chi tiet
                        </button>
                        <button type="button" className="discount-btn" onClick={withStop(onOpenDiscount)}>
                            Nhập mã giảm giá
                        </button>
                        <button type="button" className="pay-now-btn" onClick={withStop(onOpenPayment)}>
                            Thanh toán QR
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
