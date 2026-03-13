import React from "react";
import "./PaymentTable.css";
import { FiCheckCircle, FiClock } from "react-icons/fi";

export default function PaymentTable({ payment }) {
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
                    <strong>{payment.finalAmount}</strong>
                </div>
            </div>

            <div className="payment-item-footer">
                {isPaid ? (
                    <p className="paid-date">✓ Đã thanh toán ngày {payment.paidDate}</p>
                ) : (
                    <button className="pay-now-btn">Thanh toán ngay</button>
                )}
            </div>
        </div>
    );
}