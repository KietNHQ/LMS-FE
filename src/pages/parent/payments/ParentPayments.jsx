import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "./ParentPayments.css";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { parentService } from "../../../services/pages/parent/parentService";
import PaymentSummaryCard from "./components/PaymentSummaryCard/PaymentSummaryCard";
import PaymentTable from "./components/PaymentTable/PaymentTable";
import InvoiceHistory from "./components/InvoiceHistory/InvoiceHistory";
import StripeStatusChecker from "./components/StripeCheckout/StripeStatusChecker";
import StatusBadge from "../../../components/common/StatusBadge/StatusBadge";
import {
    buildBreakdownFromItems,
    formatDateVi,
    formatVnd,
    getDueStatus,
    mapFeeCategory,
    normalizeDate,
    roundMoney,
} from "../../../services/shared/payment/paymentShared";

function formatCurrency(amount) {
    return formatVnd(roundMoney(amount));
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function normalizeSchoolYearKey(value = "") {
    return String(value).replace(/\s+/g, "").trim();
}

function getSchoolYearValue(value) {
    if (value && typeof value === "object") {
        return value.label || value.name || value.id || "";
    }
    return value || "";
}

function getRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.accounts)) return payload.accounts;
    return [];
}

function getInvoiceRows(response) {
    const responseData = response?.data || response || {};
    if (Array.isArray(responseData.invoices)) return responseData.invoices;
    if (Array.isArray(responseData)) return responseData;

    for (const value of Object.values(responseData)) {
        if (Array.isArray(value)) return value;
    }

    return [];
}

function normalizeBankAccount(account = {}) {
    return {
        id: account.id,
        bankName: account.bank_name || account.bankName || "",
        accountNumber: account.account_number || account.accountNumber || "",
        accountName: account.account_holder || account.accountHolder || account.account_name || "",
        bin: account.bin || account.bank_bin || account.bankBin || "",
        isActive: account.is_active ?? account.isActive ?? true,
    };
}

function buildPaymentQrUrl(bankAccount, amount, transferNote) {
    if (!bankAccount?.accountNumber || !bankAccount?.accountName) return "";

    if (bankAccount.bin) {
        return `https://img.vietqr.io/image/${bankAccount.bin}-${bankAccount.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(bankAccount.accountName)}`;
    }

    const qrPayload = [
        bankAccount.bankName,
        `STK: ${bankAccount.accountNumber}`,
        bankAccount.accountName,
        `So tien: ${amount}`,
        `Noi dung: ${transferNote}`,
    ].filter(Boolean).join(" | ");

    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrPayload)}`;
}

// Derive school year from due date (format: "2025-2026" for Sep 2025 - Aug 2026)
function deriveSchoolYear(dueDate) {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    if (isNaN(date)) return "";
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    // School year: Aug(8) - Jul(7)
    // If Aug-Dec: currentYear - nextYear
    // If Jan-Jul: previousYear - currentYear
    if (month >= 8) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

// Derive semester from due date
function deriveSemester(dueDate) {
    if (!dueDate) return "Học kỳ";
    const date = new Date(dueDate);
    if (isNaN(date)) return "Học kỳ";
    const month = date.getMonth() + 1; // 1-12
    // Semester 1: Aug-Jan (months 8-12, 1)
    // Semester 2: Feb-Jul (months 2-7)
    if (month >= 8 || month === 1) {
        return "Học kỳ 1";
    } else {
        return "Học kỳ 2";
    }
}

/**
 * Map a raw backend invoice row to the frontend payment shape.
 * Used by both the initial fetch and the sync effect.
 */
function mapBackendInvoiceToPayment(inv) {
    const dueDate = inv.due_date || inv.fee_due_date || "";
    const schoolYear = inv.school_year_name
        || deriveSchoolYear(dueDate)
        || (inv.school_year_id ? String(inv.school_year_id) : "");

    const semester = inv.semester_name
        || (inv.semester_id ? `Học kỳ ${inv.semester_id}` : null)
        || deriveSemester(dueDate);

    const amount = parseFloat(inv.amount || 0);
    const discountAmount = parseFloat(inv.discount_amount || 0);
    const rawPaidAmount = parseFloat(inv.paid_amount || 0);
    const finalAmount = Math.max(amount - discountAmount, 0);
    const isPaid = inv.status === "paid";
    const paidAmount = isPaid && rawPaidAmount === 0 ? finalAmount : rawPaidAmount;

    return {
        id: inv.id,
        title: inv.fee_name || "Học phí",
        term: semester,
        schoolYear,
        grade: "",
        className: inv.class_name || "",
        childName: inv.student_name || "",
        deadline: dueDate,
        feeItems: [],
        description: inv.description || "",
        discountCode: inv.discount_code || "",
        discountAmount,
        status: inv.status || "unpaid",
        paidDate: inv.paid_date || "",
        paidAmount,
        invoiceCode: inv.invoice_no || inv.invoice_code || "",
        amount,
        feeAmount: parseFloat(inv.fee_amount || 0),
        feeId: inv.fee_id,
        studentId: inv.student_id,
        finalAmount,
        originalAmount: amount,
        breakdown: [
            { key: "original", label: "Số tiền gốc", amount },
            { key: "deduction", label: "Giảm giá", amount: discountAmount },
            { key: "total", label: "Tổng cộng", amount: finalAmount },
            { key: "paid", label: "Đã thanh toán", amount: paidAmount },
            { key: "remaining", label: "Còn lại", amount: Math.max(finalAmount - paidAmount, 0) },
        ],
    };
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

    // Nếu không có feeItems, dùng trực tiếp amount từ backend
    const hasItems = Array.isArray(record.feeItems) && record.feeItems.length > 0;
    const effectiveAmount = hasItems ? payableBeforePaid : roundMoney(record.amount || record.feeAmount || 0);

    const breakdown = hasItems
        ? buildBreakdownFromItems(record.feeItems || [], paidAmount).map((item) => {
            if (item.key === "deduction") {
                return { ...item, amount: roundMoney(feeSummary.deduction) };
            }
            if (item.key === "remaining") {
                return { ...item, amount: Math.max(roundMoney(payableBeforePaid - paidAmount), 0) };
            }
            return item;
        })
        : [
            { key: "original", label: "Số tiền gốc", amount: effectiveAmount },
            { key: "deduction", label: "Giảm giá", amount: roundMoney(record.discountAmount || 0) },
            { key: "total", label: "Tổng cộng", amount: Math.max(effectiveAmount - roundMoney(record.discountAmount || 0), 0) },
            { key: "paid", label: "Đã thanh toán", amount: paidAmount },
            { key: "remaining", label: "Còn lại", amount: Math.max(effectiveAmount - paidAmount - roundMoney(record.discountAmount || 0), 0) },
        ];

    return {
        ...record,
        deadline: normalizeDate(record.deadline),
        discountAmount: roundMoney(record.discountAmount || 0),
        paidAmount,
        breakdown,
        originalAmount: effectiveAmount,
        finalAmount: Math.max(effectiveAmount - roundMoney(record.discountAmount || 0), 0),
        month: (normalizeDate(record.deadline) || "").slice(0, 7),
    };
}

function normalizePaymentList(list) {
    return (list || []).map((item) => recomputePayment(item));
}

export default function ParentPayments() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [paymentList, setPaymentList] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [paymentLoadError, setPaymentLoadError] = useState("");
    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankLoadError, setBankLoadError] = useState("");

    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [discountCodeInput, setDiscountCodeInput] = useState("");
    const [discountError, setDiscountError] = useState("");
    const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [childFilter, setChildFilter] = useState("all");
    const [termFilter, setTermFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState("all");

    const selectedPayment = paymentList.find((item) => item.id === selectedPaymentId) || null;
    const selectedDetailPayment = paymentList.find((item) => item.id === selectedDetailId) || null;
    const selectedBankAccount = useMemo(
        () => bankAccounts.find((account) => account.isActive) || bankAccounts[0] || null,
        [bankAccounts],
    );

    // Fetch payments from API on component mount
    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoadingPayments(true);
            setPaymentLoadError("");
            try {
                const response = await parentService.listPayments({ mock: false });
                const paymentArray = getInvoiceRows(response);
                setPaymentList(normalizePaymentList(paymentArray.map(mapBackendInvoiceToPayment)));
            } catch (err) {
                console.error("Error fetching parent payments:", err);
                setPaymentList([]);
                setPaymentLoadError("Không thể tải dữ liệu học phí từ hệ thống.");
                toast.error("Không thể tải dữ liệu học phí.");
            } finally {
                setIsLoadingPayments(false);
            }
        };

        fetchPayments();
    }, []);

    useEffect(() => {
        const fetchBankAccounts = async () => {
            try {
                const response = await parentService.listBankAccounts({
                    params: { isActive: true },
                    mock: false,
                });
                const accounts = getRows(response).map(normalizeBankAccount);
                setBankAccounts(accounts);
                setBankLoadError("");
            } catch (error) {
                console.warn("Failed to load school bank accounts.", error);
                setBankAccounts([]);
                setBankLoadError("Chưa lấy được tài khoản ngân hàng từ hệ thống.");
            }
        };

        fetchBankAccounts();
    }, []);

    useEffect(() => {
        const handleSync = async () => {
            try {
                const response = await parentService.listPayments({ mock: false });
                const invoices = getInvoiceRows(response);
                setPaymentList(normalizePaymentList(invoices.map(mapBackendInvoiceToPayment)));
            } catch (error) {
                console.error("Failed to sync parent payments from API:", error);
            }
        };

        window.addEventListener("admin-payment-records-updated", handleSync);
        window.addEventListener("parent-payment-confirmed", handleSync);
        return () => {
            window.removeEventListener("admin-payment-records-updated", handleSync);
            window.removeEventListener("parent-payment-confirmed", handleSync);
        };
    }, []);

    const childOptions = useMemo(
        () => ["all", ...Array.from(new Set(paymentList.map((item) => item.childName).filter(Boolean)))],
        [paymentList]
    );
    const termOptions = useMemo(
        () => ["all", ...Array.from(new Set(paymentList.map((item) => item.term || item.title || "Học phí")))],
        [paymentList]
    );
    const monthOptions = useMemo(
        () => ["all", ...Array.from(new Set(paymentList.map((item) => item.month).filter(Boolean)))],
        [paymentList]
    );

    const filteredPaymentList = useMemo(() => {
        const selectedYearKey = normalizeSchoolYearKey(getSchoolYearValue(selectedSchoolYear));

        const filtered = paymentList.filter((item) => {
            const itemYearKey = normalizeSchoolYearKey(item.schoolYear);
            const childPass = childFilter === "all" || item.childName === childFilter;
            // "all" = show all terms
            const termPass = termFilter === "all" || item.term === termFilter || item.title === termFilter;
            const monthPass = monthFilter === "all" || item.month === monthFilter;
            const schoolYearPass = !selectedYearKey || itemYearKey === selectedYearKey;
            return childPass && termPass && monthPass && schoolYearPass;
        });

        return filtered.sort((a, b) => {
            const aTime = new Date(a.deadline).getTime();
            const bTime = new Date(b.deadline).getTime();
            return aTime - bTime;
        });
    }, [paymentList, childFilter, termFilter, monthFilter, selectedSchoolYear, selectedTerm]);

    const invoiceHistory = useMemo(
        () =>
            filteredPaymentList.map((item) => ({
                id: item.id,
                childName: item.childName,
                invoiceCode: item.invoiceCode || `INV-${item.id}`,
                semester: item.term || item.title,
                date: item.paidDate || "--",
                amount: formatCurrency(item.finalAmount),
                method: item.status === "paid" ? "Chuyen khoan QR" : "Chua thanh toan",
                dueStatus: getDueStatus(item),
                status: item.status,
            })),
        [filteredPaymentList]
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

    const paymentCaseStats = useMemo(() => {
        const initialCases = {
            paidOnTime: { key: "paidOnTime", label: "Đã thanh toán đúng hạn", count: 0, amount: 0 },
            paidLate: { key: "paidLate", label: "Đã thanh toán trễ hạn", count: 0, amount: 0 },
            upcoming: { key: "upcoming", label: "Chưa đến hạn", count: 0, amount: 0 },
            dueSoon: { key: "dueSoon", label: "Sắp đến hạn", count: 0, amount: 0 },
            overdue: { key: "overdue", label: "Quá hạn chưa đóng", count: 0, amount: 0 },
        };

        filteredPaymentList.forEach((item) => {
            const dueStatus = getDueStatus(item);
            const paidDateTime = item.paidDate ? new Date(item.paidDate).getTime() : null;
            const deadlineTime = item.deadline ? new Date(item.deadline).getTime() : null;

            if (item.status === "paid") {
                const paidOnTime = paidDateTime && deadlineTime ? paidDateTime <= deadlineTime : true;
                const targetKey = paidOnTime ? "paidOnTime" : "paidLate";
                initialCases[targetKey].count += 1;
                initialCases[targetKey].amount += roundMoney(item.paidAmount || item.finalAmount || 0);
                return;
            }

            if (dueStatus.key === "overdue") {
                initialCases.overdue.count += 1;
                initialCases.overdue.amount += roundMoney(item.finalAmount || 0);
                return;
            }

            if (dueStatus.key === "due_soon") {
                initialCases.dueSoon.count += 1;
                initialCases.dueSoon.amount += roundMoney(item.finalAmount || 0);
                return;
            }

            initialCases.upcoming.count += 1;
            initialCases.upcoming.amount += roundMoney(item.finalAmount || 0);
        });

        return Object.values(initialCases);
    }, [filteredPaymentList]);

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

    const applyDiscountCode = async () => {
        if (!selectedPayment) return;

        const normalizedCode = discountCodeInput.trim().toUpperCase();
        if (!normalizedCode) {
            setDiscountError("Vui lòng nhập mã giảm giá.");
            return;
        }

        try {
            const response = await parentService.applyDiscountCode({
                body: {
                    invoiceId: selectedPayment.id,
                    discountCode: normalizedCode,
                },
                mock: false,
            });

            const discountAmount = Number(
                response?.data?.discountAmount
                ?? response?.data?.discount_amount
                ?? response?.discountAmount
                ?? response?.discount_amount
                ?? 0,
            );

            if (!discountAmount) {
                setDiscountError("Hệ thống chưa trả về số tiền giảm giá cho mã này.");
                return;
            }

            const appliedDiscount = Math.min(roundMoney(discountAmount), selectedPayment.originalAmount);

            setPaymentList((prev) => prev.map((item) => {
                if (item.id !== selectedPayment.id) return item;
                return recomputePayment({
                    ...item,
                    discountCode: normalizedCode,
                    discountAmount: appliedDiscount,
                });
            }));

            setIsDiscountDialogOpen(false);
        } catch (error) {
            console.error("Failed to apply discount code:", error);
            setDiscountError(error?.response?.data?.error || error?.message || "Không thể áp dụng mã giảm giá.");
            return;
        }
    };

    const transferNote = selectedPayment
        ? `${selectedPayment.childName} ${selectedPayment.className} ${selectedPayment.title}`
        : "";

    const qrUrl = selectedPayment
        ? buildPaymentQrUrl(selectedBankAccount, selectedPayment.finalAmount, transferNote)
        : "";

    const confirmPaid = async () => {
        if (!selectedPayment) return;
        if (!selectedBankAccount) {
            toast.error("Chưa có tài khoản ngân hàng để xác nhận chuyển khoản.");
            return;
        }

        setIsQrDialogOpen(false);

        let apiResponse;
        try {
            apiResponse = await parentService.payInvoice({
                pathParams: { id: String(selectedPayment.id) },
                body: { amount: selectedPayment.finalAmount, paymentMethod: "bank_transfer" },
                mock: false,
            });
        } catch (err) {
            toast.error("Không thể ghi nhận thanh toán: " + (err?.message || err?.error || "Lỗi không xác định"));
            return;
        }

        toast.success("Đã ghi nhận thanh toán thành công. Nhà trường sẽ xác nhận trong thời gian sớm nhất.");

        setPaymentList((prev) =>
            prev.map((item) => {
                if (item.id !== selectedPayment.id) return item;
                // Use data from API response if available, otherwise fall back to computed values
                const apiData = apiResponse?.data;
                const status = apiData?.status || "paid";
                const paidAmount = apiData?.paid_amount !== undefined
                    ? parseFloat(apiData.paid_amount)
                    : item.finalAmount;
                const paidDate = apiData?.paid_date || getToday();
                return recomputePayment({
                    ...item,
                    status,
                    paidDate,
                    paidAmount,
                });
            })
        );

        // Dispatch event so admin-side payment hub can reflect the update
        window.dispatchEvent(new CustomEvent("parent-payment-confirmed", {
            detail: { paymentId: selectedPayment.id }
        }));
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
            <div className="parent-payments-top-panel">
                <div className="parent-payments-header">
                    <div className="parent-payments-header__title">
                        <h1>Học phí</h1>
                    </div>

                    <div className="parent-payments-header__selector">
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={(term) => {
                                handleTermChange(term);
                                setTermFilter(term === "hk2" ? "Học kỳ 2" : "Học kỳ 1");
                            }}
                        />
                    </div>
                </div>

                <div className="payment-filter-row">
                    <Select
                        variant="custom"
                        value={childFilter}
                        options={childOptions.map(item => ({ value: item, label: item === "all" ? "Tất cả học sinh" : item }))}
                        onChange={(e) => setChildFilter(e.target.value)}
                    />
                    <Select
                        variant="custom"
                        value={termFilter}
                        options={termOptions.map(item => ({ value: item, label: item === "all" ? "Tất cả kỳ" : item }))}
                        onChange={(e) => setTermFilter(e.target.value)}
                    />
                    <Select
                        variant="custom"
                        value={monthFilter}
                        options={monthOptions.map(item => ({ value: item, label: item === "all" ? "Tất cả tháng" : item }))}
                        onChange={(e) => setMonthFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="payment-summary-grid">
                {summaryData.map((item) => (
                    <PaymentSummaryCard key={item.id} item={item} />
                ))}
            </div>

            {paymentLoadError ? (
                <p className="dialog-error-text">{paymentLoadError}</p>
            ) : null}

            <section className="payment-case-section">
                <h3>Các trường hợp đóng tiền</h3>
                <div className="payment-case-grid">
                    {paymentCaseStats.map((item) => (
                        <article key={item.key} className="payment-case-item">
                            <p>{item.label}</p>
                            <strong>{item.count} hóa đơn</strong>
                            <span>{formatCurrency(item.amount)}</span>
                        </article>
                    ))}
                </div>
            </section>

            <div className="payment-table-list">
                {isLoadingPayments ? (
                    <p className="dialog-helper-text">Đang tải dữ liệu học phí...</p>
                ) : filteredPaymentList.length === 0 ? (
                    <p className="dialog-helper-text">Không có hóa đơn phù hợp với bộ lọc hiện tại.</p>
                ) : filteredPaymentList.map((item) => {
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
                        onStripeSuccess={() => {}}
                        onBeforeStripeRedirect={(payment) => {
                            setSelectedPaymentId(payment.id);
                            setIsQrDialogOpen(false);
                        }}
                        onStripeError={(msg) => toast.error(msg)}
                        onVnpaySuccess={() => {}}
                        onBeforeVnpayRedirect={(payment) => {
                            setSelectedPaymentId(payment.id);
                            setIsQrDialogOpen(false);
                        }}
                        onVnpayError={(msg) => toast.error(msg)}
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
                        Mã giảm giá sẽ được kiểm tra từ hệ thống tài chính.
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
                        {selectedBankAccount && qrUrl ? (
                            <>
                                <div className="qr-wrap">
                                    <img src={qrUrl} alt="QR thanh toán" className="qr-image" />
                                </div>

                                <div className="qr-payment-meta">
                                    <p><strong>Ngân hàng:</strong> {selectedBankAccount.bankName || "--"}</p>
                                    <p><strong>STK:</strong> {selectedBankAccount.accountNumber}</p>
                                    <p><strong>Tên tài khoản:</strong> {selectedBankAccount.accountName}</p>
                                    <p><strong>Số tiền:</strong> {formatCurrency(selectedPayment.finalAmount)}</p>
                                    <p><strong>Nội dung CK:</strong> {transferNote}</p>
                                </div>
                            </>
                        ) : (
                            <p className="dialog-error-text">
                                {bankLoadError || "Chưa có tài khoản ngân hàng đang hoạt động để tạo QR thanh toán."}
                            </p>
                        )}

                        <div className="dialog-action-row">
                            <button type="button" className="dialog-btn ghost" onClick={() => setIsQrDialogOpen(false)}>
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="dialog-btn primary"
                                onClick={confirmPaid}
                                disabled={!selectedBankAccount}
                            >
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

            <StripeStatusChecker onStatusUpdate={() => {}} />
        </div>
    );
}
