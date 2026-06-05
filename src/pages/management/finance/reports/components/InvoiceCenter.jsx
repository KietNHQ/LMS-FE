import React, { useEffect, useState, useCallback } from "react";
import { FiFileText, FiSend, FiCheckCircle, FiAlertCircle, FiSearch, FiRefreshCcw, FiPenTool } from "react-icons/fi";
import { toast } from "react-toastify";
import { financeService } from "../../../../services/pages/management/finance";
import { useSchoolYearTerm } from "../../../../../hooks/useSchoolYearTerm";

const STATUS_LABELS = {
    signed: "Đã ký",
    draft: "Nháp",
    canceled: "Đã hủy",
};

const DELIVERY_LABELS = {
    sent: "Đã gửi",
    not_sent: "Chưa gửi",
    failed: "Gửi lỗi",
    none: "-",
};

const normalizeInvoice = (inv) => {
    const base = {
        id: inv.id,
        invoiceCode: inv.invoice_no || inv.invoiceCode || "",
        studentName: inv.student_given_name && inv.student_surname
            ? `${inv.student_surname} ${inv.student_given_name}`
            : inv.studentName || inv.student?.fullName || "-",
        issueDate: inv.created_at || inv.issueDate,
        totalAmount: parseFloat(inv.total_amount || inv.amount || inv.amount_paid || 0),
        amountPaid: parseFloat(inv.paid_amount || inv.amount_paid || 0),
        status: inv.signed ? "signed" : (inv.status || "draft"),
        deliveryStatus: inv.sent ? "sent" : (inv.deliveryStatus || "not_sent"),
    };
    return { ...base, ...inv };
};

export default function InvoiceCenter({ invoices: propInvoices }) {
    const { selectedSchoolYear, selectedTerm } = useSchoolYearTerm();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await financeService.getAllInvoices({
                params: {
                    schoolYearId: selectedSchoolYear?.id,
                    semesterId: selectedTerm?.id,
                    limit: 200,
                },
            });
            if (res?.success && res.data) {
                const rows = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.items)
                    ? res.data.items
                    : [];
                setInvoices(rows.map(normalizeInvoice));
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Không thể tải danh sách hóa đơn");
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear, selectedTerm]);

    useEffect(() => {
        if (propInvoices && propInvoices.length > 0) {
            setInvoices(propInvoices.map(normalizeInvoice));
        } else {
            fetchInvoices();
        }
    }, [propInvoices, fetchInvoices]);

    const handleSign = async () => {
        const unpaidInvoices = invoices.filter((inv) => !inv.signed && (inv.status === "unpaid" || inv.status === "partial"));
        if (unpaidInvoices.length === 0) {
            toast.warning("Không có hóa đơn nào để ký.");
            return;
        }
        let signedCount = 0;
        for (const inv of unpaidInvoices) {
            try {
                await financeService.signInvoice(inv.id);
                signedCount++;
            } catch (err) {
                console.error(`[InvoiceCenter] sign error for invoice ${inv.id}:`, err);
            }
        }
        if (signedCount > 0) {
            toast.success(`Đã ký số ${signedCount} hóa đơn.`);
            fetchInvoices();
        } else {
            toast.error("Không thể ký hóa đơn. Kiểm tra quyền.");
        }
    };

    const handleSend = async (invoice) => {
        try {
            await financeService.sendInvoice(invoice.id, { body: { channel: "email" } });
            toast.success(`Đã gửi hóa đơn ${invoice.invoiceCode} qua email`);
            fetchInvoices();
        } catch (err) {
            console.error("[InvoiceCenter] send error:", err);
            const msg = err?.response?.data?.error || err?.message || "Đã xảy ra lỗi";
            toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
    };

    return (
        <div className="report-panel invoice-center-panel">
            <div className="rp-header-row invoice-center__header">
                <h3 className="rp-header invoice-center__title"><FiFileText /> Trung tâm Hóa đơn điện tử (HĐĐT)</h3>
                <div className="invoice-center__actions">
                    <button className="btn-secondary invoice-action-btn" onClick={handleSign}><FiPenTool /> Ký số hàng loạt</button>
                    <button className="btn-primary invoice-action-btn" onClick={fetchInvoices}><FiRefreshCcw /> Làm mới</button>
                </div>
            </div>

            <div className="invoice-filters invoice-center__filters">
                <div className="invoice-center__search-wrap">
                    <FiSearch className="invoice-center__search-icon" />
                    <input type="text" className="rp-select invoice-center__search" placeholder="Số hóa đơn, tên học sinh..." />
                </div>
                <select className="rp-select invoice-center__status-select">
                    <option>Trạng thái: Tất cả</option>
                    <option>Chưa ký</option>
                    <option>Đã ký</option>
                    <option>Đang chờ gửi</option>
                </select>
                <button className="btn-secondary invoice-refresh-btn" onClick={fetchInvoices} title="Làm mới danh sách"><FiRefreshCcw /></button>
            </div>

            <div className="report-table-wrap">
                <table className="report-table invoice-center__table">
                    <thead>
                        <tr>
                            <th>Số HĐ</th>
                            <th>Học sinh</th>
                            <th>Ngày xuất</th>
                            <th>Số tiền</th>
                            <th>Trạng thái HĐ</th>
                            <th>Gửi phụ huynh</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="loading-cell">Đang tải...</td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-cell">Không có hóa đơn nào</td>
                            </tr>
                        ) : (
                            invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td className="invoice-id">{inv.invoiceCode || inv.code}</td>
                                    <td>{inv.studentName || "-"}</td>
                                    <td>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("vi-VN") : "-"}</td>
                                    <td className="invoice-amount">{(inv.totalAmount || 0).toLocaleString("vi-VN")} ₫</td>
                                    <td>
                                        <span className={`invoice-status invoice-status--${inv.status || "draft"}`}>
                                            {STATUS_LABELS[inv.status] || STATUS_LABELS.draft}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`invoice-delivery invoice-delivery--${inv.deliveryStatus || "not_sent"}`}>
                                            {inv.deliveryStatus === "sent" && <FiCheckCircle />}
                                            {inv.deliveryStatus === "failed" && <FiAlertCircle />}
                                            {DELIVERY_LABELS[inv.deliveryStatus] || DELIVERY_LABELS.not_sent}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-icon invoice-file-btn" title="Gửi hóa đơn" onClick={() => handleSend(inv)}>
                                            <FiSend />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
