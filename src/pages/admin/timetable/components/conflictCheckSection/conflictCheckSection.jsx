import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import "./conflictCheckSection.css";

export default function ConflictCheckSection({ conflicts }) {
    return (
        <aside className="tt-conflict-section">
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
                        <article key={conflict.id} className="tt-conflict-item">
                            <div className="tt-conflict-item-top">
                                <strong>{conflict.type}</strong>
                                <span>{conflict.dayPeriod}</span>
                            </div>
                            <p>{conflict.detail}</p>
                        </article>
                    ))}
                </div>
            )}
        </aside>
    );
}

