import React, { useMemo, useState } from "react";
import { FiAlertCircle, FiChevronDown } from "react-icons/fi";
import "./conflictCheckSection.css";

export default function ConflictCheckSection({ conflicts, inDialog = false }) {
    const [expandedConflictId, setExpandedConflictId] = useState(null);

    const suggestionsByType = useMemo(() => ({
        "Giáo viên": [
            "Đổi tiết cho một lớp sang khung giờ khác trong ngày hoặc tuần.",
            "Phân công giáo viên cùng bộ môn thay thế cho một trong hai lớp.",
            "Giữ nguyên lớp ưu tiên và dời lớp còn lại sang buổi sáng/chiều phù hợp.",
        ],
        "Phòng": [
            "Đổi phòng học còn trống cùng khung giờ cho một trong hai lớp.",
            "Đổi ca học của một lớp để tránh trùng phòng.",
            "Nếu phòng chuyên dụng, ưu tiên lớp cần thiết bị rồi dời lớp còn lại.",
        ],
    }), []);

    const handleToggleConflict = (conflictId) => {
        setExpandedConflictId((prev) => (prev === conflictId ? null : conflictId));
    };

    return (
        <aside className={`tt-conflict-section ${inDialog ? "in-dialog" : ""}`.trim()}>
            <div className="tt-conflict-header">
                <h3>Kiểm tra xung đột</h3>
                <span>{conflicts.length}</span>
            </div>

            {conflicts.length === 0 ? (
                <div className="tt-conflict-empty">
                    <FiAlertCircle />
                    <p>Không phát hiện xung đột trong bộ lọc hiện tại.</p>
                </div>
            ) : (
                <div className="tt-conflict-list">
                    {conflicts.map((conflict) => (
                        <article
                            key={conflict.id}
                            className={`tt-conflict-item ${expandedConflictId === conflict.id ? "is-open" : ""}`.trim()}
                        >
                            <button
                                type="button"
                                className="tt-conflict-toggle"
                                onClick={() => handleToggleConflict(conflict.id)}
                                aria-expanded={expandedConflictId === conflict.id}
                            >
                                <div className="tt-conflict-item-top">
                                    <strong>{conflict.type}</strong>
                                    <span>{conflict.dayPeriod}</span>
                                </div>
                                <p>{conflict.detail}</p>
                                <span className="tt-conflict-chevron" aria-hidden="true">
                                    <FiChevronDown />
                                </span>
                            </button>

                            {expandedConflictId === conflict.id && (
                                <div className="tt-conflict-solution">
                                    <h4>Hướng giải quyết</h4>
                                    <ul>
                                        {(suggestionsByType[conflict.type] || ["Rà soát lại lịch và đổi sang khung giờ/phòng trống phù hợp."])
                                            .map((tip) => (
                                                <li key={`${conflict.id}-${tip}`}>{tip}</li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </aside>
    );
}

