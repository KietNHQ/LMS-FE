import React, { useMemo, useState } from "react";
import "./LeaveRequestSection.css";
import { parentService } from "../../../../../services/pages/parent/parentService";
import { formatDateVi } from "../../../../../utils/dateUtils";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Plus,
    Send,
    UserRoundCheck,
    X,
    XCircle,
} from "lucide-react";

const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const statusMap = {
    approved: { key: "approved", text: "Đã duyệt" },
    pending: { key: "pending", text: "Đang chờ" },
    rejected: { key: "rejected", text: "Bị từ chối" }
}

const normalizeStatus = (value) => {
    if (value === "approved" || value === "Đã duyệt") return statusMap.approved
    if (value === "rejected" || value === "Bị từ chối") return statusMap.rejected
    return statusMap.pending
}

const cleanText = (value) => {
    const text = String(value || "").trim()
    return text && text !== "—" && text !== "-" ? text : ""
}

const countLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    const dayMs = 24 * 60 * 60 * 1000
    return Math.max(1, Math.round((end - start) / dayMs) + 1)
}

const getStatusIcon = (status) => {
    if (status === "approved") return <CheckCircle2 size={15} />
    if (status === "rejected") return <XCircle size={15} />
    return <Clock3 size={15} />
}

export default function LeaveRequestSection({ requests = [], childId, onSuccess, compact = false }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "", note: "" })
    const [submitMessage, setSubmitMessage] = useState("")

    const normalizedRequests = useMemo(() => {
        if (!requests || requests.length === 0) return []
        return requests.map((item) => {
            const statusInfo = normalizeStatus(item.statusText || item.status)
            const startDateVal = item.startDate || item.start_date
            const endDateVal = item.endDate || item.end_date
            const reviewedByVal = cleanText(
                item.reviewedByName ||
                item.reviewed_by_name ||
                item.approvedByName ||
                item.approved_by_name ||
                item.approvedBy ||
                item.reviewedBy?.fullName ||
                item.reviewedBy?.name
            )
            const roleLabel = item.approvedByRole === "teacher"
                ? "Giáo viên chủ nhiệm"
                : item.approvedByRole === "manager"
                    ? "Quản lý trường"
                    : ""
            const reviewerLabel = reviewedByVal || roleLabel || (
                statusInfo.key === "pending" ? "Chờ xử lý" : "Người xử lý chưa cập nhật"
            )
            const dayCount = item.totalDays || item.total_days || countLeaveDays(startDateVal, endDateVal)
            const dateLabel = startDateVal && endDateVal
                ? `${formatDateVi(startDateVal)}${startDateVal === endDateVal ? "" : ` đến ${formatDateVi(endDateVal)}`}${dayCount ? ` · ${dayCount} ngày` : ""}`
                : (item.date ? formatDateVi(item.date, item.date) : "Chưa cập nhật ngày nghỉ")
            return {
                id: item.id || `${item.studentId || "student"}-${item.startDate || "start"}-${item.endDate || "end"}-${item.reason || "leave"}`,
                title: cleanText(item.title || item.reason) || "Đơn xin nghỉ học",
                date: dateLabel,
                approvedBy: reviewerLabel,
                status: statusInfo.key,
                statusText: item.statusText || statusInfo.text,
                note: cleanText(item.note || item.notes),
            }
        })
    }, [requests])

    const statusCounts = useMemo(() => {
        return normalizedRequests.reduce((counts, item) => {
            counts[item.status] = (counts[item.status] || 0) + 1
            return counts
        }, { approved: 0, pending: 0, rejected: 0 })
    }, [normalizedRequests])

    const summaryText = normalizedRequests.length > 0
        ? `${normalizedRequests.length} đơn đã gửi · ${statusCounts.pending} đang chờ`
        : "Chưa có đơn đã gửi"

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => {
            const next = { ...prev, [name]: value }
            if (name === "startDate" && next.endDate && value > next.endDate) {
                next.endDate = value
            }
            return next
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
            setSubmitMessage("Ngày kết thúc không được trước ngày bắt đầu.")
            return
        }

        try {
            const res = await parentService.createLeaveRequest({
                body: {
                    studentId: childId,
                    reason: formData.reason,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    notes: formData.note
                },
                mock: false
            })
            if (res?.success) {
                setSubmitMessage(`Đã gửi đơn xin nghỉ học từ ${formatDate(formData.startDate)} đến ${formatDate(formData.endDate)} thành công!`)
                setIsDialogOpen(false)
                setFormData({ reason: "", startDate: "", endDate: "", note: "" })
                if (onSuccess) onSuccess()
            } else {
                setSubmitMessage("Có lỗi xảy ra khi gửi đơn.")
            }
        } catch (err) {
            console.error("Error submitting leave request:", err)
            setSubmitMessage("Có lỗi xảy ra khi gửi đơn xin nghỉ phép.")
        }
    }

    return (
        <div className={`leave-card${compact ? " is-compact" : ""}`}>
            <div className="section-heading">
                <div className="leave-heading-copy">
                    <h3>Đơn xin phép</h3>
                    <p>{summaryText}</p>
                </div>
                <button
                    type="button"
                    className="leave-action-btn"
                    aria-label="Làm đơn xin nghỉ"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus size={16} /> <span>Làm đơn xin nghỉ</span>
                </button>
            </div>

            {submitMessage && <p className="leave-note">{submitMessage}</p>}

            {normalizedRequests.length === 0 ? (
                <div className="leave-empty">
                    <FileText size={28} />
                    <p>Chưa có đơn xin nghỉ học nào.</p>
                </div>
            ) : (
            <div className="leave-list">
                {normalizedRequests.map((item) => (
                    <article key={item.id} className={`leave-item leave-item--${item.status}`}>
                        <div className="leave-info">
                            <div className="leave-title-row">
                                <strong>{item.title}</strong>
                                <div className={`leave-status ${item.status}`}>
                                    {getStatusIcon(item.status)}
                                    {item.statusText}
                                </div>
                            </div>
                            <div className="leave-meta">
                                <span><CalendarDays size={14} /> {item.date}</span>
                                <span><UserRoundCheck size={14} /> {item.approvedBy}</span>
                            </div>
                            {item.note && <p className="leave-item-note">{item.note}</p>}
                        </div>
                    </article>
                ))}
            </div>
            )}

            {isDialogOpen && (
                <div className="leave-dialog-backdrop" onClick={() => setIsDialogOpen(false)}>
                    <div
                        className="leave-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Form đơn xin nghỉ học"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="leave-dialog-header">
                            <div>
                                <h4>Đơn xin nghỉ học</h4>
                                <p>Điền thời gian và lý do để gửi giáo viên xét duyệt.</p>
                            </div>
                            <button
                                type="button"
                                className="leave-dialog-close"
                                aria-label="Đóng"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form className="leave-form" onSubmit={handleSubmit}>
                            <label>
                                Lý do
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Em bị sốt cần nghỉ theo dõi tại nhà"
                                    required
                                />
                            </label>

                            <div className="leave-form-row">
                                <label>
                                    Từ ngày
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Đến ngày
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        min={formData.startDate || undefined}
                                        required
                                    />
                                </label>
                            </div>

                            <label>
                                Ghi chú thêm
                                <input
                                    type="text"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    placeholder="Thông tin thêm (nếu có)"
                                />
                            </label>

                            <div className="leave-form-actions">
                                <button type="button" className="btn-light" onClick={() => setIsDialogOpen(false)}>
                                    <X size={16} /> Đóng
                                </button>
                                <button type="submit" className="btn-primary" disabled={!childId}>
                                    <Send size={16} /> Gửi đơn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
