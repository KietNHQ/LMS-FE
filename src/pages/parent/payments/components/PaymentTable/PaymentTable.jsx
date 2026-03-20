import React from "react";
import "./PaymentTable.css";
import { FiCheckCircle, FiClock } from "react-icons/fi";

export default function PaymentTable({
    payment,
    onOpenDiscount,
    onOpenPayment,
    onExportPdf,
}) {
    const isPaid = payment.status === "paid";

    return (
        <div className={`payment-item-card ${isPaid ? "paid" : "unpaid"}`}>
            <div className="payment-item-header">
                <div>
                    <h2>{payment.title}</h2>
                    <p>
                        {payment.className} • Hạn: {payment.deadline}
                    </p>
                </div>

                <div className={`payment-status-badge ${payment.status}`}>
                    {isPaid ? <FiCheckCircle /> : <FiClock />}
                    <span>{isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</span>
                </div>
            </div>

            <div className="payment-item-grid">
                <div className="payment-info-box">
                    <span>Học phí gốc</span>
                    <strong>{payment.originalFee}</strong>
                </div>

                <div className="payment-info-box">
                    <span>Giảm giá</span>
                    <strong className={payment.discount !== "—" ? "discount-text" : ""}>
                        {payment.discount}
                    </strong>
                </div>

                <div className={`payment-info-box final-box ${payment.status}`}>
                    <span>Thực thu</span>
                    <strong>{payment.finalAmountText}</strong>
                </div>
            </div>

            <div className="payment-item-footer">
                {isPaid ? (
                    <div className="paid-action-wrap">
                        <p className="paid-date">✓ Đã thanh toán ngày {payment.paidDate}</p>
                        <button type="button" className="export-pdf-btn" onClick={onExportPdf}>
                            Xuất file PDF
                        </button>
                    </div>
                ) : (
                    <div className="payment-action-wrap">
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