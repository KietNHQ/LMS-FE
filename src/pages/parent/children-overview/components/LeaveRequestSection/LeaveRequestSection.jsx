import React, { useMemo, useState } from "react";
import "./LeaveRequestSection.css";

const fallbackRequests = [
        {
            title: "Sốt cao và nghỉ tại nhà",
            date: "2026-03-01",
            approvedBy: "Giáo viên chủ nhiệm",
            status: "approved",
            statusText: "Đã duyệt",
        },
        {
            title: "Công việc của gia đình",
            date: "2026-03-08",
            approvedBy: "—",
            status: "pending",
            statusText: "Đang chờ",
        },
        {
            title: "Khám sức khỏe",
            date: "2026-03-10",
            approvedBy: "Văn phòng nhà trường",
            status: "rejected",
            statusText: "Bị từ chối",
        },
]

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

export default function LeaveRequestSection({ requests = [] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ reason: "", startDate: "", endDate: "", note: "" })
    const [submitMessage, setSubmitMessage] = useState("")

    const normalizedRequests = useMemo(() => {
        const source = requests.length > 0 ? requests : fallbackRequests
        return source.map((item) => {
            const statusInfo = normalizeStatus(item.statusText || item.status)
            return {
                title: item.title || item.reason || "Đơn xin nghỉ học",
                date: item.date || "--",
                approvedBy: item.approvedBy || item.approver || "—",
                status: statusInfo.key,
                statusText: item.statusText || statusInfo.text
            }
        })
    }, [requests])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setSubmitMessage(`Đã tạo đơn demo từ ${formData.startDate} đến ${formData.endDate}.`)
        setIsDialogOpen(false)
        setFormData({ reason: "", startDate: "", endDate: "", note: "" })
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

            <div className="leave-list">
                {normalizedRequests.map((item, index) => (
                    <div key={index} className="leave-item">
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
