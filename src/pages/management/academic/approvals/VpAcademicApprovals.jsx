import { useCallback, useEffect, useMemo, useState } from "react";
import { SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { dataLockingService } from "../../../../services/pages/admin/locking/dataLockingService";
import {
    FiUnlock, FiFileText, FiUser, FiClock,
    FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicApprovals.css";

const unwrapRows = (payload) => {
    const data = payload?.data ?? payload ?? {};
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.requests)) return data.requests;
    if (Array.isArray(data.items)) return data.items;
    return [];
};

const formatRelativeTime = (value) => {
    if (!value) return "Không ghi nhận";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
};

const getSlaStatus = (value) => {
    if (!value) return "normal";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "normal";
    const hours = (Date.now() - date.getTime()) / 3600000;
    if (hours >= 72) return "danger";
    if (hours >= 24) return "warning";
    return "normal";
};

const getRequestTitle = (request) => {
    const className = request.class_name || `Lớp #${request.class_id || "?"}`;
    if (request.target_type === "conduct") return `Yêu cầu mở khóa hạnh kiểm ${className}`;
    return `Yêu cầu mở khóa điểm ${className}`;
};

const normalizeRequest = (request) => ({
    id: request.id,
    type: request.target_type || "grade",
    title: getRequestTitle(request),
    desc: request.reason || "Giáo viên yêu cầu chỉnh sửa dữ liệu đã chốt.",
    sender: request.requested_by_name || "Giáo viên",
    role: request.target_type === "conduct" ? "GVCN" : "Giáo viên",
    time: formatRelativeTime(request.requested_at),
    subject: request.class_name || `Lớp #${request.class_id || "?"}`,
    evidence: request.grade_item_id ? `Mã đầu điểm #${request.grade_item_id}` : "Mở khóa theo học sinh/học kỳ",
    slaStatus: getSlaStatus(request.requested_at),
    raw: request,
});

const normalizeHistory = (request) => ({
    id: request.id,
    action: request.status === "approved" ? "Đã duyệt mở khóa" : request.status === "rejected" ? "Đã từ chối mở khóa" : "Yêu cầu đã hết hạn",
    target: request.class_name || `Lớp #${request.class_id || "?"}`,
    time: formatRelativeTime(request.reviewed_at || request.requested_at),
    by: request.reviewed_by_name || "Hệ thống",
    status: request.status === "approved" ? "approved" : "rejected",
});

export default function VpAcademicApprovals() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actingId, setActingId] = useState(null);
    const [loadError, setLoadError] = useState("");

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const semesterId = selectedTerm === "all"
                ? null
                : await resolveSemesterId(selectedSchoolYear, selectedTerm);

            const baseParams = {
                targetType: "grade",
                limit: 100,
                ...(semesterId ? { semesterId } : {}),
            };

            const [pendingRes, allRes] = await Promise.all([
                dataLockingService.listUnlockRequests({ params: { ...baseParams, status: "pending" } }),
                dataLockingService.listUnlockRequests({ params: baseParams }),
            ]);

            const pendingRows = unwrapRows(pendingRes).map(normalizeRequest);
            const reviewedRows = unwrapRows(allRes)
                .filter((item) => item.status && item.status !== "pending")
                .slice(0, 8)
                .map(normalizeHistory);

            setRequests(pendingRows);
            setHistory(reviewedRows);
        } catch (error) {
            console.error("Load unlock approvals error:", error);
            setLoadError("Không thể tải danh sách yêu cầu mở khóa.");
            setRequests([]);
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear, selectedTerm]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const pendingCountLabel = useMemo(() => {
        if (isLoading) return "Đang tải";
        return `${requests.length}`;
    }, [isLoading, requests.length]);

    const handleAction = async (id, action) => {
        const target = requests.find((item) => item.id === id);
        if (!target) return;

        let notes = "";
        if (action === "reject") {
            notes = window.prompt("Nhập lý do từ chối yêu cầu mở khóa:");
            if (!notes) return;
            if (notes.trim().length < 5) {
                toast.warning("Lý do từ chối phải có ít nhất 5 ký tự.");
                return;
            }
        }

        setActingId(id);
        try {
            if (action === "approve") {
                await dataLockingService.approveUnlockRequest(id, {
                    notes: "VP học vụ duyệt yêu cầu mở khóa điểm",
                });
                toast.success(`Đã phê duyệt yêu cầu #${id}. Điểm đã chuyển về bản nháp.`);
            } else {
                await dataLockingService.rejectUnlockRequest(id, {
                    notes: notes.trim(),
                });
                toast.info(`Đã từ chối yêu cầu #${id}.`);
            }
            await loadRequests();
        } catch (error) {
            console.error("Unlock approval action error:", error);
            toast.error(error?.response?.data?.error || error?.message || "Không thể xử lý yêu cầu.");
        } finally {
            setActingId(null);
        }
    };

    return (
        <div className="vp-approvals-premium">
            <div className="vpa-custom-header">
                <div className="vpa-header-left">
                    <h1>Quản lý Phê Duyệt & Mở Khóa</h1>
                </div>
                <div className="vpa-header-right">
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                        className="vpa-selector-override"
                    />
                </div>
            </div>

            <div className="approvals-grid">
                <div className="requests-section">
                    <div className="section-header-vpa">
                        <div className="sh-left">
                            <FiFileText className="sh-icon" />
                            <h3>Hàng chờ yêu cầu ({pendingCountLabel})</h3>
                        </div>
                        <div className="sla-legend">
                            <div className="legend-item"><span className="dot normal"></span> &lt; 24h</div>
                            <div className="legend-item"><span className="dot warning"></span> 24h - 72h</div>
                            <div className="legend-item"><span className="dot danger"></span> &gt; 72h</div>
                        </div>
                    </div>

                    {loadError ? (
                        <div className="empty-vpa is-error">
                            <div className="empty-icon-wrapper"><FiAlertTriangle /></div>
                            <h4>Không tải được dữ liệu</h4>
                            <p>{loadError}</p>
                            <button type="button" className="btn-approve-log btn-inline" onClick={loadRequests}>Tải lại</button>
                        </div>
                    ) : (
                        <div className="request-cards-vpa">
                            {requests.length === 0 ? (
                                <div className="empty-vpa">
                                    <div className="empty-icon-wrapper">
                                        <FiCheckCircle />
                                    </div>
                                    <h4>Tuyệt vời!</h4>
                                    <p>Đã hoàn thành toàn bộ yêu cầu trong hàng chờ.</p>
                                </div>
                            ) : (
                                requests.map(req => (
                                    <div className={`req-card-vpa sla-${req.slaStatus}`} key={req.id}>
                                        <div className="req-card-header">
                                            <div className="req-id">
                                                {req.type === "conduct" ? <FiUnlock /> : <FiFileText />}
                                                <span>REQ-{req.id}</span>
                                            </div>
                                            <div className={`sla-timer ${req.slaStatus}`}>
                                                <FiClock /> {req.time}
                                            </div>
                                        </div>

                                        <div className="req-card-body">
                                            <h4>{req.title}</h4>
                                            <p className="req-desc">{req.desc}</p>

                                            <div className="req-info-grid">
                                                <div className="info-col">
                                                    <div className="info-item">
                                                        <FiUser className="item-icon" />
                                                        <div className="item-content">
                                                            <span>{req.role}</span>
                                                            <strong>{req.sender}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="info-col">
                                                    <div className="info-item">
                                                        <FiFileText className="item-icon" />
                                                        <div className="item-content">
                                                            <span>Đơn vị</span>
                                                            <strong>{req.subject}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="info-col">
                                                    <div className="info-item evidence">
                                                        <FiUnlock className="item-icon" />
                                                        <div className="item-content">
                                                            <span>Phạm vi</span>
                                                            <strong>{req.evidence}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="req-card-actions">
                                            <button
                                                className="btn-approve-log"
                                                onClick={() => handleAction(req.id, "approve")}
                                                disabled={actingId === req.id}
                                            >
                                                <FiCheckCircle /> Duyệt & Ghi Log
                                            </button>
                                            <button
                                                className="btn-reject"
                                                onClick={() => handleAction(req.id, "reject")}
                                                disabled={actingId === req.id}
                                            >
                                                <FiXCircle /> Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="history-sidebar">
                    <div className="sidebar-header">
                        <h3>Nhật ký thẩm quyền (Audit Log)</h3>
                    </div>
                    <div className="history-timeline">
                        {history.length === 0 ? (
                            <div className="history-empty">Chưa có yêu cầu mở khóa đã xử lý.</div>
                        ) : history.map(item => (
                            <div className="timeline-item" key={item.id}>
                                <div className={`timeline-indicator ${item.status}`}></div>
                                <div className="timeline-content">
                                    <div className="content-main">
                                        <strong>{item.action}</strong>
                                        <span className="target">Đối tượng: {item.target}</span>
                                    </div>
                                    <div className="content-meta">
                                        {item.time} - Bởi: {item.by}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="history-footer">
                            <FiInfo /> Nhật ký phê duyệt có hiệu lực pháp lý theo Thông tư 42.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

