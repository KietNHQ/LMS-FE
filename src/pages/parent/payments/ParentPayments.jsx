import { useEffect, useMemo, useState } from "react";
import "./ParentPayments.css";
import Modal from "../../../components/ui/Modal/Modal";
import PaymentSummaryCard from "./components/PaymentSummaryCard/PaymentSummaryCard";
import PaymentTable from "./components/PaymentTable/PaymentTable";
import InvoiceHistory from "./components/InvoiceHistory/InvoiceHistory";
import StatusBadge from "../../../components/common/StatusBadge/StatusBadge";
import {
    PAYMENT_STORAGE_KEYS,
    buildBreakdownFromItems,
    formatDateVi,
    formatVnd,
    getDueStatus,
    loadJson,
    mapFeeCategory,
    normalizeDate,
    roundMoney,
    saveJson,
} from "../../../services/shared/payment/paymentShared";

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
    return formatVnd(roundMoney(amount));
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function getFallbackPayments() {
    return [
        {
            id: 1,
            title: "Hoc phi HK1",
            term: "Học kỳ 1",
            schoolYear: "2025-2026",
            grade: "Khoi 10",
            className: "10A1",
            childName: "Nguyen Van B",
            deadline: "2025-09-30",
            feeItems: [
                { id: "f-1", name: "Hoc phi", note: "Bat buoc", amount: 3800000 },
                { id: "f-2", name: "Ban tru", note: "Bat buoc", amount: 700000 },
                { id: "f-3", name: "Dich vu xe dua don", note: "Dich vu", amount: 350000 },
                { id: "f-4", name: "Dong phuc", note: "Phat sinh", amount: 150000 },
            ],
            description: "Khoan thu hoc ky 1 duoc tao tu danh muc thu cua nha truong.",
            discountCode: "",
            discountAmount: 0,
            status: "paid",
            paidDate: "2025-09-25",
            paidAmount: 5000000,
            invoiceCode: "INV-HK1-2025-10A1-01",
        },
        {
            id: 2,
            title: "Hoc phi HK2",
            term: "Học kỳ 2",
            schoolYear: "2025-2026",
            grade: "Khoi 10",
            className: "10A1",
            childName: "Nguyen Van B",
            deadline: "2026-02-28",
            feeItems: [
                { id: "f-5", name: "Hoc phi", note: "Bat buoc", amount: 3600000 },
                { id: "f-6", name: "Ban tru", note: "Bat buoc", amount: 700000 },
                { id: "f-7", name: "Dich vu CLB", note: "Dich vu", amount: 200000 },
            ],
            description: "Khoan thu hoc ky 2, se cap nhat theo xac nhan tu admin.",
            discountCode: "FIX500",
            discountAmount: 500000,
            status: "unpaid",
            paidDate: "",
            paidAmount: 0,
            invoiceCode: "INV-HK2-2026-10A1-01",
        },
    ];
}

function recomputePayment(record) {
    const feeSummary = {
        tuition: 0,
        boarding: 0,
        service: 0,
        extra: 0,
        deduction: 0,
    };

    (record.feeItems || []).forEach((item) => {
        const amount = roundMoney(item.amount);
        const category = mapFeeCategory(item.name, item.note);
        if (category === "deduction") {
            feeSummary.deduction += Math.abs(amount);
        } else {
            feeSummary[category] += amount;
        }
    });

    feeSummary.deduction += roundMoney(record.discountAmount || 0);
    const payableBeforePaid = Math.max(
        feeSummary.tuition + feeSummary.boarding + feeSummary.service + feeSummary.extra - feeSummary.deduction,
        0
    );
    const paidAmount = record.status === "paid" ? roundMoney(record.paidAmount || payableBeforePaid) : 0;
    const breakdown = buildBreakdownFromItems(record.feeItems || [], paidAmount).map((item) => {
        if (item.key === "deduction") {
            return { ...item, amount: roundMoney(feeSummary.deduction) };
        }
        if (item.key === "remaining") {
            return { ...item, amount: Math.max(roundMoney(payableBeforePaid - paidAmount), 0) };
        }
        return item;
    });

    return {
        ...record,
        deadline: normalizeDate(record.deadline),
        discountAmount: roundMoney(record.discountAmount || 0),
        paidAmount,
        breakdown,
        originalAmount: roundMoney(feeSummary.tuition + feeSummary.boarding + feeSummary.service + feeSummary.extra),
        finalAmount: roundMoney(payableBeforePaid),
        month: (normalizeDate(record.deadline) || "").slice(0, 7),
    };
}

function normalizePaymentList(list) {
    return (list || []).map((item) => recomputePayment(item));
}

export default function ParentPayments() {
    const [paymentList, setPaymentList] = useState(() => {
        const stored = loadJson(PAYMENT_STORAGE_KEYS.PARENT_RECORDS, []);
        const initial = stored.length ? stored : getFallbackPayments();
        const normalized = normalizePaymentList(initial);
        saveJson(PAYMENT_STORAGE_KEYS.PARENT_RECORDS, normalized);
        return normalized;
    });

    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [discountCodeInput, setDiscountCodeInput] = useState("");
    const [discountError, setDiscountError] = useState("");
    const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [childFilter, setChildFilter] = useState("all");
    const [termFilter, setTermFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState("all");
    const [sortByDeadline, setSortByDeadline] = useState("asc");

    const selectedPayment = paymentList.find((item) => item.id === selectedPaymentId) || null;
    const selectedDetailPayment = paymentList.find((item) => item.id === selectedDetailId) || null;

    useEffect(() => {
        const handleSync = () => {
            const stored = loadJson(PAYMENT_STORAGE_KEYS.PARENT_RECORDS, []);
            if (stored.length) {
                setPaymentList(normalizePaymentList(stored));
            }
        };

        window.addEventListener("admin-payment-records-updated", handleSync);
        return () => window.removeEventListener("admin-payment-records-updated", handleSync);
    }, []);

    const childOptions = useMemo(
        () => ["all", ...Array.from(new Set(paymentList.map((item) => item.childName)))],
        [paymentList]
    );
    const termOptions = useMemo(
        () => ["all", ...Array.from(new Set(paymentList.map((item) => item.term || item.title)))],
        [paymentList]
    );
    const monthOptions = useMemo(
        () => ["all", ...Array.from(new Set(paymentList.map((item) => item.month).filter(Boolean)))],
        [paymentList]
    );

    const filteredPaymentList = useMemo(() => {
        const filtered = paymentList.filter((item) => {
            const childPass = childFilter === "all" || item.childName === childFilter;
            const termPass = termFilter === "all" || (item.term || item.title) === termFilter;
            const monthPass = monthFilter === "all" || item.month === monthFilter;
            return childPass && termPass && monthPass;
        });

        return filtered.sort((a, b) => {
            const aTime = new Date(a.deadline).getTime();
            const bTime = new Date(b.deadline).getTime();
            return sortByDeadline === "asc" ? aTime - bTime : bTime - aTime;
        });
    }, [paymentList, childFilter, termFilter, monthFilter, sortByDeadline]);

    const invoiceHistory = useMemo(
        () =>
            paymentList.map((item) => ({
                id: item.id,
                invoiceCode: item.invoiceCode,
                semester: item.term || item.title,
                date: item.paidDate || "--",
                amount: formatCurrency(item.finalAmount),
                method: item.status === "paid" ? "Chuyen khoan QR" : "Chua thanh toan",
                dueStatus: getDueStatus(item),
                status: item.status,
            })),
        [paymentList]
    );

    const summaryData = useMemo(() => {
        const paidAmount = paymentList
            .filter((item) => item.status === "paid")
            .reduce((sum, item) => sum + item.paidAmount, 0);

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

    const openDetailDialog = (paymentId) => {
        setSelectedDetailId(paymentId);
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

        const appliedDiscount = Math.min(roundMoney(discountAmount), selectedPayment.originalAmount);

        setPaymentList((prev) => {
            const next = prev.map((item) => {
                if (item.id !== selectedPayment.id) return item;
                return recomputePayment({
                    ...item,
                    discountCode: normalizedCode,
                    discountAmount: appliedDiscount,
                });
            });
            saveJson(PAYMENT_STORAGE_KEYS.PARENT_RECORDS, next);
            return next;
        });

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

        setPaymentList((prev) => {
            const next = prev.map((item) => {
                if (item.id !== selectedPayment.id) return item;
                return recomputePayment({
                    ...item,
                    status: "paid",
                    paidDate,
                    paidAmount: item.finalAmount,
                });
            });
            saveJson(PAYMENT_STORAGE_KEYS.PARENT_RECORDS, next);
            return next;
        });

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
      <tr><td>Tong phai thu</td><td>${formatCurrency(payment.finalAmount)}</td></tr>
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
                <p>Dong bo khoan thu tu admin, theo doi han nop va chi tiet hoa don.</p>
            </div>

            <div className="payment-filter-row">
                <select value={childFilter} onChange={(event) => setChildFilter(event.target.value)}>
                    {childOptions.map((item) => (
                        <option key={item} value={item}>{item === "all" ? "Tat ca hoc sinh" : item}</option>
                    ))}
                </select>
                <select value={termFilter} onChange={(event) => setTermFilter(event.target.value)}>
                    {termOptions.map((item) => (
                        <option key={item} value={item}>{item === "all" ? "Tat ca ky" : item}</option>
                    ))}
                </select>
                <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
                    {monthOptions.map((item) => (
                        <option key={item} value={item}>{item === "all" ? "Tat ca thang" : item}</option>
                    ))}
                </select>
                <select value={sortByDeadline} onChange={(event) => setSortByDeadline(event.target.value)}>
                    <option value="asc">Han nop gan nhat</option>
                    <option value="desc">Han nop xa nhat</option>
                </select>
            </div>

            <div className="payment-summary-grid">
                {summaryData.map((item) => (
                    <PaymentSummaryCard key={item.id} item={item} />
                ))}
            </div>

            <div className="payment-table-list">
                {filteredPaymentList.map((item) => {
                    const dueStatus = getDueStatus(item);
                    return (
                    <PaymentTable
                        key={item.id}
                        payment={{
                            ...item,
                            deadlineLabel: formatDateVi(item.deadline),
                            dueStatus,
                        }}
                        onOpenDiscount={() => openDiscountDialog(item.id)}
                        onOpenPayment={() => openQrDialog(item.id)}
                        onExportPdf={() => exportPdf(item)}
                        onOpenDetail={() => openDetailDialog(item.id)}
                    />
                );
                })}
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

            <Modal
                open={!!selectedDetailPayment}
                title="Chi tiet hoa don"
                onClose={() => setSelectedDetailId(null)}
                className="payment-detail-modal"
            >
                {selectedDetailPayment ? (
                    <div className="parent-payment-dialog-content">
                        <p>
                            <strong>{selectedDetailPayment.invoiceCode}</strong> - {selectedDetailPayment.childName} ({selectedDetailPayment.className})
                        </p>
                        <p>{selectedDetailPayment.description}</p>
                        <p>
                            <strong>Trang thai:</strong>{" "}
                            <StatusBadge status={getDueStatus(selectedDetailPayment).badgeStatus}>
                                {getDueStatus(selectedDetailPayment).label}
                            </StatusBadge>
                        </p>

                        <div className="invoice-detail-fee-table-wrap">
                            <table className="invoice-detail-fee-table">
                                <thead>
                                    <tr>
                                        <th>Khoan thu</th>
                                        <th>Mo ta</th>
                                        <th>So tien</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedDetailPayment.feeItems || []).map((fee) => (
                                        <tr key={fee.id}>
                                            <td>{fee.name}</td>
                                            <td>{fee.note || "--"}</td>
                                            <td>{formatCurrency(fee.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="invoice-detail-breakdown-grid">
                            {selectedDetailPayment.breakdown.map((line) => (
                                <div key={line.key} className="invoice-detail-breakdown-item">
                                    <span>{line.label}</span>
                                    <strong>{formatCurrency(line.amount)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}


