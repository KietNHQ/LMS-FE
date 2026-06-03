import React, { useMemo, useState } from "react";
import "./LeaveRequestSection.css";
import { parentService } from "../../../../../services/pages/parent/parentService";

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

export default function LeaveRequestSection({ requests = [], childId, onSuccess }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "", note: "" })
    const [submitMessage, setSubmitMessage] = useState("")

    const normalizedRequests = useMemo(() => {
        if (!requests || requests.length === 0) return []
        return requests.map((item) => {
            const statusInfo = normalizeStatus(item.statusText || item.status)
            return {
                id: item.id || `${item.studentId}-${item.startDate}-${Date.now()}-${Math.random()}`,
                title: item.title || item.reason || "Đơn xin nghỉ học",
                date: item.startDate && item.endDate ? `${formatDate(item.startDate)} đến ${formatDate(item.endDate)}` : (item.date || "--"),
                approvedBy: item.approvedByRole === "teacher" ? "Giáo viên chủ nhiệm" : (item.approvedByRole === "manager" ? "Quản lý trường" : (item.approvedBy || "—")),
                status: statusInfo.key,
                statusText: item.statusText || statusInfo.text
            }
        })
    }, [requests])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
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
        <div className="leave-card">
            <div className="section-heading">
                <h3>Đơn xin phép</h3>
                <button type="button" className="leave-action-btn" onClick={() => setIsDialogOpen(true)}>
                    Làm đơn xin nghỉ
                </button>
            </div>

            {submitMessage && <p className="leave-note">{submitMessage}</p>}

            {normalizedRequests.length === 0 ? (
                <div className="leave-empty">
                    <p>Chưa có đơn xin nghỉ học nào.</p>
                </div>
            ) : (
            <div className="leave-list">
                {normalizedRequests.map((item) => (
                    <div key={item.id} className="leave-item">
                        <div className="leave-info">
                            <strong>{item.title}</strong>
                            <span>
                {item.date} • Được duyệt bởi: {item.approvedBy}
              </span>
                        </div>
                        <div className={`leave-status ${item.status}`}>
                            {item.statusText}
                        </div>
                    </div>
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
                        <h4>Đơn xin nghỉ học</h4>
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
                                    Đóng
                                </button>
                                <button type="submit" className="btn-primary">
                                    Gửi đơn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
