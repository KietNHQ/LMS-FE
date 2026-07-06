import React, { useCallback, useMemo, useState, useEffect } from "react";
import { teacherService } from "../../../../../services/pages/teacher/teacherService";
import { toast } from "react-toastify";
import { FiCheck, FiX, FiAlertCircle, FiClock, FiFileText, FiMessageCircle } from "react-icons/fi";
import { formatDateTimeVi, formatDateVi } from "../../../../../utils/dateUtils";
import "./HomeroomLeaveRequestsSection.css";

export default function HomeroomLeaveRequestsSection({ classId, dateFrom = "", dateTo = "" }) {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [feedbackInput, setFeedbackInput] = useState({});
    const [activeActionId, setActiveActionId] = useState(null); // ID of request being approved/rejected to show feedback box
    const [actionType, setActionType] = useState(""); // 'approved' or 'rejected'

    const effectiveDateFrom = filterDateFrom || dateFrom;
    const effectiveDateTo = filterDateTo || dateTo;

    const fetchLeaveRequests = useCallback(async () => {
        if (!classId) {
            setRequests([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const res = await teacherService.getClassLeaveRequests({
                pathParams: { classId },
                params: {
                    date_from: effectiveDateFrom || undefined,
                    date_to: effectiveDateTo || undefined
                },
                mock: false // Use real API
            });
            if (res.success && res.data) {
                setRequests(res.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error("Failed to fetch leave requests:", error);
            toast.error("Lỗi khi tải danh sách đơn xin nghỉ học.");
        } finally {
            setIsLoading(false);
        }
    }, [classId, effectiveDateFrom, effectiveDateTo]);

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleActionClick = (id, type) => {
        setActiveActionId(id);
        setActionType(type);
        setFeedbackInput(prev => ({ ...prev, [id]: "" }));
    };

    const handleCancelAction = () => {
        setActiveActionId(null);
        setActionType("");
    };

    const handleConfirmStatus = async (id) => {
        const feedback = feedbackInput[id] || "";
        try {
            const res = await teacherService.updateLeaveRequestStatus({
                pathParams: { id },
                body: {
                    action: actionType,
                    admin_notes: feedback.trim() || (actionType === "approved" ? "Đã đồng ý đơn xin phép." : "Từ chối đơn xin phép.")
                },
                mock: false // Use real API
            });

            if (res.success) {
                toast.success(actionType === "approved" ? "Đã phê duyệt đơn thành công." : "Đã từ chối đơn xin nghỉ học.");
                setActiveActionId(null);
                setActionType("");
                fetchLeaveRequests();
            } else {
                toast.error(res.error || res.message || "Cập nhật đơn xin nghỉ thất bại.");
            }
        } catch (error) {
            console.error("Error updating leave request status:", error);
            toast.error("Có lỗi xảy ra khi cập nhật đơn.");
        }
    };

    const requestCounts = useMemo(() => ({
        all: requests.length,
        pending: requests.filter(r => r.status === "pending").length,
        approved: requests.filter(r => r.status === "approved").length,
        rejected: requests.filter(r => r.status === "rejected").length
    }), [requests]);

    const filteredRequests = useMemo(() => {
        if (filterStatus === "all") return requests;
        return requests.filter(req => req.status === filterStatus);
    }, [requests, filterStatus]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return <span className="status-badge approved"><FiCheck /> Đã duyệt</span>;
            case "rejected":
                return <span className="status-badge rejected"><FiX /> Từ chối</span>;
            default:
                return <span className="status-badge pending"><FiClock /> Chờ duyệt</span>;
        }
    };

    return (
        <div className="homeroom-leave-requests-container">
            <div className="leave-requests-header">
                <div className="header-meta">
                    <h4>Phê duyệt đơn xin nghỉ học</h4>
                    <p>Danh sách đơn do phụ huynh gửi yêu cầu phê duyệt vắng mặt</p>
                </div>
                
                <div className="status-tabs-wrapper">
                    <button
                        type="button"
                        className={`status-tab-btn ${filterStatus === "all" ? "active" : ""}`}
                        onClick={() => setFilterStatus("all")}
                    >
                        Tất cả ({requestCounts.all})
                    </button>
                    <button
                        type="button"
                        className={`status-tab-btn ${filterStatus === "pending" ? "active" : ""}`}
                        onClick={() => setFilterStatus("pending")}
                    >
                        Chờ duyệt ({requestCounts.pending})
                    </button>
                    <button
                        type="button"
                        className={`status-tab-btn ${filterStatus === "approved" ? "active" : ""}`}
                        onClick={() => setFilterStatus("approved")}
                    >
                        Đã duyệt ({requestCounts.approved})
                    </button>
                    <button
                        type="button"
                        className={`status-tab-btn ${filterStatus === "rejected" ? "active" : ""}`}
                        onClick={() => setFilterStatus("rejected")}
                    >
                        Từ chối ({requestCounts.rejected})
                    </button>
                </div>
            </div>

            <div className="leave-requests-filters">
                <label>
                    Từ ngày
                    <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(event) => setFilterDateFrom(event.target.value)}
                    />
                </label>
                <label>
                    Đến ngày
                    <input
                        type="date"
                        value={filterDateTo}
                        onChange={(event) => setFilterDateTo(event.target.value)}
                    />
                </label>
                {(filterDateFrom || filterDateTo) && (
                    <button
                        type="button"
                        className="leave-requests-clear-filter"
                        onClick={() => {
                            setFilterDateFrom("");
                            setFilterDateTo("");
                        }}
                    >
                        Xóa lọc ngày
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="leave-requests-loading">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách đơn...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="leave-requests-empty">
                    <FiAlertCircle size={48} />
                    <p>Không tìm thấy đơn xin nghỉ học nào phù hợp.</p>
                </div>
            ) : (
                <div className="leave-requests-list">
                    {filteredRequests.map((req) => (
                        <div key={req.id} className={`leave-request-card ${req.status}`}>
                            <div className="card-top-row">
                                <div className="student-profile-info">
                                    <div className="avatar-placeholder">
                                        {(req.student?.fullName || "S")[0].toUpperCase()}
                                    </div>
                                    <div className="profile-text">
                                        <h5>{req.student?.fullName}</h5>
                                        <span>Mã học sinh: {req.student?.studentCode}</span>
                                    </div>
                                </div>
                                <div className="card-status-badge">
                                    {getStatusBadge(req.status)}
                                </div>
                            </div>

                            <div className="card-body-content">
                                <div className="info-item date">
                                    <span className="info-label"><FiClock /> Thời gian nghỉ:</span>
                                    <span className="info-value text-highlight">
                                        {formatDateVi(req.startDate)} đến {formatDateVi(req.endDate)}
                                    </span>
                                </div>
                                
                                <div className="info-item reason">
                                    <span className="info-label"><FiFileText /> Lý do xin phép:</span>
                                    <span className="info-value">{req.reason}</span>
                                </div>

                                {req.notes && (
                                    <div className="info-item note">
                                        <span className="info-label"><FiMessageCircle /> Ghi chú từ phụ huynh:</span>
                                        <span className="info-value text-muted">"{req.notes}"</span>
                                    </div>
                                )}

                                {req.adminNotes && (
                                    <div className="info-item feedback-received">
                                        <span className="info-label">Phản hồi của GV:</span>
                                        <span className="info-value italic-value">"{req.adminNotes}"</span>
                                    </div>
                                )}

                                {req.reviewedByName && (
                                    <div className="info-item feedback-received">
                                        <span className="info-label">Người xử lý:</span>
                                        <span className="info-value">
                                            {req.reviewedByName}
                                            {req.reviewedAt ? ` • ${formatDateTimeVi(req.reviewedAt)}` : ""}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {req.status === "pending" && activeActionId !== req.id && (
                                <div className="card-actions">
                                    <button
                                        type="button"
                                        className="btn-action reject"
                                        onClick={() => handleActionClick(req.id, "rejected")}
                                    >
                                        <FiX /> Từ chối
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action approve"
                                        onClick={() => handleActionClick(req.id, "approved")}
                                    >
                                        <FiCheck /> Phê duyệt
                                    </button>
                                </div>
                            )}

                            {activeActionId === req.id && (
                                <div className="feedback-action-box">
                                    <h6>
                                        {actionType === "approved" ? "Nhập phản hồi phê duyệt" : "Lý do từ chối đơn nghỉ"}
                                    </h6>
                                    <textarea
                                        className="feedback-textarea"
                                        placeholder={
                                            actionType === "approved"
                                                ? "Ví dụ: Nhà trường đồng ý cho em nghỉ học..."
                                                : "Ví dụ: Lý do xin nghỉ chưa rõ ràng..."
                                        }
                                        value={feedbackInput[req.id] || ""}
                                        onChange={(e) => setFeedbackInput({ ...feedbackInput, [req.id]: e.target.value })}
                                        required={actionType === "rejected"}
                                    />
                                    <div className="feedback-box-actions">
                                        <button
                                            type="button"
                                            className="btn-text"
                                            onClick={handleCancelAction}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-confirm ${actionType}`}
                                            onClick={() => handleConfirmStatus(req.id)}
                                        >
                                            Xác nhận {actionType === "approved" ? "Duyệt" : "Từ chối"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
