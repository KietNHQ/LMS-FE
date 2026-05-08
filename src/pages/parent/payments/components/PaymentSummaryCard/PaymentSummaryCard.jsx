import React from "react";
import "./PaymentSummaryCard.css";
import { FiCheckCircle, FiCreditCard, FiTag } from "react-icons/fi";

export default function PaymentSummaryCard({ item }) {
    const iconMap = {
        paid: <FiCheckCircle />,
        unpaid: <FiCreditCard />,
        discount: <FiTag />,
    };

    return (
        <div className={`payment-summary-card ${item.type}`}>
            <div className={`payment-summary-icon ${item.type}`}>
                {iconMap[item.type]}
            </div>

            <div className="payment-summary-content">
                <span className="payment-summary-title">{item.title}</span>
                <strong className="payment-summary-amount">{item.amount}</strong>
            </div>
        </div>
    );
}
