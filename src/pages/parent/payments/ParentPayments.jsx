import React from "react";
import "./ParentPayments.css";
import PaymentSummaryCard from "./components/PaymentSummaryCard/PaymentSummaryCard";
import PaymentTable from "./components/PaymentTable/PaymentTable";
import InvoiceHistory from "./components/InvoiceHistory/InvoiceHistory";

export default function ParentPayments() {
    const summaryData = [
        {
            id: 1,
            type: "paid",
            title: "Đã thanh toán",
            amount: "5.000.000 ₫",
        },
        {
            id: 2,
            type: "unpaid",
            title: "Chưa thanh toán",
            amount: "4.500.000 ₫",
        },
        {
            id: 3,
            type: "discount",
            title: "Tổng giảm giá",
            amount: "500.000 ₫",
        },
    ];

    const paymentList = [
        {
            id: 1,
            title: "Học phí HK1",
            className: "10A1",
            deadline: "2024-09-30",
            originalFee: "5.000.000 ₫",
            discount: "—",
            finalAmount: "5.000.000 ₫",
            status: "paid",
            paidDate: "2024-09-25",
        },
        {
            id: 2,
            title: "Học phí HK2",
            className: "10A1",
            deadline: "2025-02-28",
            originalFee: "5.000.000 ₫",
            discount: "-500.000 ₫",
            finalAmount: "4.500.000 ₫",
            status: "unpaid",
        },
    ];

    const invoiceHistory = [
        {
            id: 1,
            invoiceCode: "INV-HK1-2024",
            semester: "Học phí HK1",
            date: "2024-09-25",
            amount: "5.000.000 ₫",
            method: "Chuyển khoản",
            status: "Đã thanh toán",
        },
        {
            id: 2,
            invoiceCode: "INV-HK2-2025",
            semester: "Học phí HK2",
            date: "2025-02-20",
            amount: "4.500.000 ₫",
            method: "Chưa thanh toán",
            status: "Chờ thanh toán",
        },
    ];

    return (
        <div className="parent-payments-page">
            <div className="parent-payments-header">
                <h1>Học phí</h1>
                <span className="payment-subtitle">
    Chi tiết hóa đơn và trạng thái thanh toán </span>
            </div>
            <div className="payment-summary-grid">
                {summaryData.map((item) => (
                    <PaymentSummaryCard key={item.id} item={item} />
                ))}
            </div>

            <div className="payment-table-list">
                {paymentList.map((item) => (
                    <PaymentTable key={item.id} payment={item} />
                ))}
            </div>

            <InvoiceHistory invoices={invoiceHistory} />
        </div>
    );
}