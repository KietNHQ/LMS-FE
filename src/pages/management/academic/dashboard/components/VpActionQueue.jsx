import React from "react";
import { FiUnlock, FiFileText, FiClock, FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import "./VpActionQueue.css";

const MOCK_TASKS = [
    { id: "UQ-102", type: "unlock", title: "Mở khóa sổ điểm Toán 10A1", sender: "GV. Nguyễn Văn A", time: "15p trước", sla: "normal", reason: "Nhập sai hệ số cột điểm 15p" },
    { id: "GQ-405", type: "grade_change", title: "Sửa điểm thi Văn 12A2", sender: "GV. Trần Thị B", time: "25 giờ trước", sla: "warning", reason: "Học sinh phúc khảo thành công" },
    { id: "UQ-105", type: "unlock", title: "Mở khóa chốt học bạ 11A5", sender: "GVCN. Lê Văn C", time: "74 giờ trước", sla: "danger", reason: "Bổ sung minh chứng HSG cấp tỉnh" },
];

export default function VpActionQueue() {
    return (
        <div className="vp-action-queue">
            <div className="queue-header">
                <h3>Hàng chờ Phê duyệt (SLA Tracking)</h3>
                <span className="queue-count">{MOCK_TASKS.length} yêu cầu</span>
            </div>

            <div className="queue-list">
                {MOCK_TASKS.map(task => (
                    <div key={task.id} className={`queue-item sla-${task.sla}`}>
                        <div className="task-icon-wrap">
                            {task.type === 'unlock' ? <FiUnlock /> : <FiFileText />}
                        </div>
                        
                        <div className="task-main">
                            <div className="task-top">
                                <span className="task-id">{task.id}</span>
                                <span className="task-time"><FiClock /> {task.time}</span>
                            </div>
                            <h4>{task.title}</h4>
                            <p className="task-sender">Gửi bởi: <strong>{task.sender}</strong></p>
                            <p className="task-reason"><em>Lý do: {task.reason}</em></p>
                        </div>

                        <div className="task-actions-vpa">
                            {task.sla === 'danger' && <div className="sla-alert"><FiAlertTriangle /> Quá hạn xử lý</div>}
                            <div className="btn-group-vpa">
                                <button className="vpa-btn approve" title="Phê duyệt">
                                    <FiCheck /> Duyệt
                                </button>
                                <button className="vpa-btn reject" title="Từ chối">
                                    <FiX /> Từ chối
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
