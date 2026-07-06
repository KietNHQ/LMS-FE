import React from "react";
import { FiUnlock, FiFileText, FiClock, FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import "./VpActionQueue.css";

export default function VpActionQueue({ tasks = [], onApprove, onReject }) {
    return (
        <div className="vp-action-queue">
            <div className="queue-header">
                <h3>Hàng chờ Phê duyệt (SLA Tracking)</h3>
                <span className="queue-count">{tasks.length} yêu cầu</span>
            </div>

            <div className="queue-list">
                {tasks.length === 0 ? (
                    <div className="queue-empty">Không có yêu cầu chờ xử lý.</div>
                ) : tasks.map(task => (
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
                                <button className="vpa-btn approve" title="Phê duyệt" onClick={() => onApprove?.(task)}>
                                    <FiCheck /> Duyệt
                                </button>
                                <button className="vpa-btn reject" title="Từ chối" onClick={() => onReject?.(task)}>
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
