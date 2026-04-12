import { useMemo, useState } from "react";
import "./ParentPayments.css";
import Modal from "../../../../../../components/ui/Modal/Modal";
import PaymentSummaryCard from "./components/PaymentSummaryCard/PaymentSummaryCard";
import PaymentTable from "./components/PaymentTable/PaymentTable";
import InvoiceHistory from "./components/InvoiceHistory/InvoiceHistory";

const BANK_INFO = {
    accountNumber: "0000000000",
    accountName: "CONG TY GIA LAP EDUVN DEMO",
    bankName: "NGAN HANG DEMO",
    bin: "970422",
};

const DISCOUNT_RULES = {
    GIAM10: { type: "percent", value: 10 },
    PHUHUYNH5: { type: "percent", value: 5 },
    FIX500: { type: "fixed", value: 500000 },
};

function formatCurrency(amount) {
    return `${Number(amount).toLocaleString("vi-VN")} ₫`;
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

export default function ParentPayments() {
    const [paymentList, setPaymentList] = useState([
        {
            id: 1,
            title: "Học phí HK1",
            className: "10A1",
            childName: "Nguyễn Văn B",
            deadline: "2024-09-30",
            originalAmount: 5000000,
            discountAmount: 0,
            finalAmount: 5000000,
            discountCode: "",
            status: "paid",
            paidDate: "2024-09-25",
            invoiceCode: "INV-HK1-2024",
        },
        {
            id: 2,
            title: "Học phí HK2",
            className: "10A1",
            childName: "Nguyễn Văn B",
            deadline: "2025-02-28",
            originalAmount: 5000000,
            discountAmount: 500000,
            finalAmount: 4500000,
            discountCode: "FIX500",
            status: "unpaid",
            paidDate: "",
            invoiceCode: "INV-HK2-2025",
        },
    ]);

    const [invoiceHistory, setInvoiceHistory] = useState([
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
    ]);

    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [discountCodeInput, setDiscountCodeInput] = useState("");
    const [discountError, setDiscountError] = useState("");
    const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

    const selectedPayment = paymentList.find((item) => item.id === selectedPaymentId) || null;

    const summaryData = useMemo(() => {
        const paidAmount = paymentList
            .filter((item) => item.status === "paid")
            .reduce((sum, item) => sum + item.finalAmount, 0);

        const unpaidAmount = paymentList
            .filter((item) => item.status !== "paid")
            .reduce((sum, item) => sum + item.finalAmount, 0);

        const discountAmount = paymentList.reduce((sum, item) => sum + item.discountAmount, 0);

        return [
            { id: 1, type: "paid", title: "Đã thanh toán", amount: formatCurrency(paidAmount) },
            { id: 2, type: "unpaid", title: "Chưa thanh toán", amount: formatCurrency(unpaidAmount) },
            { id: 3, type: "discount", title: "Tổng giảm giá", amount: formatCurrency(discountAmount) },
        ];
    }, [paymentList]);

    const openDiscountDialog = (paymentId) => {
        const payment = paymentList.find((item) => item.id === paymentId);
        setSelectedPaymentId(paymentId);
        setDiscountCodeInput(payment?.discountCode || "");
        setDiscountError("");
        setIsDiscountDialogOpen(true);
    };

    const openQrDialog = (paymentId) => {
        setSelectedPaymentId(paymentId);
        setIsQrDialogOpen(true);
    };

    const applyDiscountCode = () => {
        if (!selectedPayment) return;

        const normalizedCode = discountCodeInput.trim().toUpperCase();
        if (!normalizedCode) {
            setDiscountError("Vui lòng nhập mã giảm giá.");
            return;
        }

        const rule = DISCOUNT_RULES[normalizedCode];
        if (!rule) {
            setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
            return;
        }

        const discountAmount =
            rule.type === "percent"
                ? Math.round((selectedPayment.originalAmount * rule.value) / 100)
                : rule.value;

        const appliedDiscount = Math.min(discountAmount, selectedPayment.originalAmount);
        const finalAmount = Math.max(selectedPayment.originalAmount - appliedDiscount, 0);

        setPaymentList((prev) =>
            prev.map((item) =>
                item.id === selectedPayment.id
                    ? {
                        ...item,
                        discountCode: normalizedCode,
                        discountAmount: appliedDiscount,
                        finalAmount,
                    }
                    : item
            )
        );

        setIsDiscountDialogOpen(false);
    };

    const transferNote = selectedPayment
        ? `${selectedPayment.childName} ${selectedPayment.className} ${selectedPayment.title}`
        : "";

    const qrUrl = selectedPayment
        ? `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?amount=${selectedPayment.finalAmount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`
        : "";

    const confirmPaid = () => {
        if (!selectedPayment) return;

        const paidDate = getToday();

        setPaymentList((prev) =>
            prev.map((item) =>
                item.id === selectedPayment.id
                    ? {
                        ...item,
                        status: "paid",
                        paidDate,
                    }
                    : item
            )
        );

        setInvoiceHistory((prev) =>
            prev.map((invoice) =>
                invoice.invoiceCode === selectedPayment.invoiceCode
                    ? {
                        ...invoice,
                        date: paidDate,
                        amount: formatCurrency(selectedPayment.finalAmount),
                        method: "Chuyển khoản QR",
                        status: "Đã thanh toán",
                    }
                    : invoice
            )
        );

        setIsQrDialogOpen(false);
    };

    const exportPdf = (payment) => {
        const printWindow = window.open("", "_blank", "width=860,height=720");
        if (!printWindow) return;

        const html = `
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Bien lai ${payment.invoiceCode}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
      h1 { font-size: 22px; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; }
      td { border: 1px solid #e5e7eb; padding: 10px; font-size: 14px; }
      td:first-child { width: 32%; font-weight: 700; background: #f9fafb; }
      .note { margin-top: 16px; color: #6b7280; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>Bien lai thanh toan hoc phi</h1>
    <table>
      <tr><td>Ma hoa don</td><td>${payment.invoiceCode}</td></tr>
      <tr><td>Noi dung</td><td>${payment.title}</td></tr>
      <tr><td>Hoc sinh</td><td>${payment.childName}</td></tr>
      <tr><td>Lop</td><td>${payment.className}</td></tr>
      <tr><td>Hoc phi goc</td><td>${formatCurrency(payment.originalAmount)}</td></tr>
      <tr><td>Giam gia</td><td>${formatCurrency(payment.discountAmount)}</td></tr>
      <tr><td>Tong da dong</td><td>${formatCurrency(payment.finalAmount)}</td></tr>
      <tr><td>Ngay thanh toan</td><td>${payment.paidDate}</td></tr>
      <tr><td>Phuong thuc</td><td>Chuyen khoan QR</td></tr>
    </table>
    <p class="note">Luu y: Chon Save as PDF trong hop thoai in de tai file PDF.</p>
    <script>window.onload = function(){ window.print(); };</script>
  </body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="parent-payments-page">
            <div className="parent-payments-header">
                <h1>Học phí</h1>
                <p>Chi tiết hóa đơn, mã giảm giá và luồng thanh toán QR cho phụ huynh.</p>
            </div>
            <div className="payment-summary-grid">
                {summaryData.map((item) => (
                    <PaymentSummaryCard key={item.id} item={item} />
                ))}
            </div>

            <div className="payment-table-list">
                {paymentList.map((item) => (
                    <PaymentTable
                        key={item.id}
                        payment={{
                            ...item,
                            originalFee: formatCurrency(item.originalAmount),
                            discount: item.discountAmount > 0 ? `- ${formatCurrency(item.discountAmount)}` : "—",
                            finalAmountText: formatCurrency(item.finalAmount),
                        }}
                        onOpenDiscount={() => openDiscountDialog(item.id)}
                        onOpenPayment={() => openQrDialog(item.id)}
                        onExportPdf={() => exportPdf(item)}
                    />
                ))}
            </div>

            <InvoiceHistory invoices={invoiceHistory} />

            <Modal
                open={isDiscountDialogOpen}
                title="Nhập mã giảm giá"
                onClose={() => setIsDiscountDialogOpen(false)}
            >
                <div className="parent-payment-dialog-content">
                    <p className="dialog-helper-text">
                        Mã đang hỗ trợ: <strong>GIAM10</strong>, <strong>PHUHUYNH5</strong>, <strong>FIX500</strong>
                    </p>

                    <input
                        className="dialog-text-input"
                        value={discountCodeInput}
                        onChange={(event) => {
                            setDiscountCodeInput(event.target.value);
                            setDiscountError("");
                        }}
                        placeholder="Ví dụ: GIAM10"
                    />

                    {discountError ? <p className="dialog-error-text">{discountError}</p> : null}

                    <div className="dialog-action-row">
                        <button type="button" className="dialog-btn ghost" onClick={() => setIsDiscountDialogOpen(false)}>
                            Đóng
                        </button>
                        <button type="button" className="dialog-btn primary" onClick={applyDiscountCode}>
                            Áp dụng mã
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={isQrDialogOpen}
                title="Thanh toán qua QR"
                onClose={() => setIsQrDialogOpen(false)}
                className="payment-qr-modal"
            >
                {selectedPayment ? (
                    <div className="parent-payment-dialog-content">
                        <div className="qr-wrap">
                            <img src={qrUrl} alt="QR thanh toán" className="qr-image" />
                        </div>

                        <div className="qr-payment-meta">
                            <p className="qr-demo-warning">
                                [MO PHONG] Du lieu thanh toan chi de test giao dien, khong dung chuyen khoan that.
                            </p>
                            <p><strong>Ngân hàng:</strong> {BANK_INFO.bankName}</p>
                            <p><strong>STK:</strong> {BANK_INFO.accountNumber}</p>
                            <p><strong>Tên tài khoản:</strong> {BANK_INFO.accountName}</p>
                            <p><strong>Số tiền:</strong> {formatCurrency(selectedPayment.finalAmount)}</p>
                            <p><strong>Nội dung CK:</strong> {transferNote}</p>
                        </div>

                        <div className="dialog-action-row">
                            <button type="button" className="dialog-btn ghost" onClick={() => setIsQrDialogOpen(false)}>
                                Đóng
                            </button>
                            <button type="button" className="dialog-btn primary" onClick={confirmPaid}>
                                Tôi đã chuyển khoản
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}


