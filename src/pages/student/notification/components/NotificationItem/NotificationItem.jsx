import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import "./NotificationItem.css";

export default function NotificationItem({ item, onOpen, onToggleImportant }) {
    return (
        <div className="notification-card">
            <div className="notification-body" onClick={() => onOpen(item)}>
                <div className="notification-icon">🔔</div>

                <div className="notification-content">
                    <div className="notification-title">
                        {item.title}
                        {item.unread && <span className="unread-dot" />}
                    </div>

                    <p className="notification-text">{item.content}</p>

                    <div className="notification-date">{item.date}</div>
                </div>
            </div>

            <div className="star-box" onClick={() => onToggleImportant(item.id)}>
                {item.important ? (
                    <FaStar className="star-active" />
                ) : (
                    <FiStar className="star" />
                )}
            </div>
        </div>
    );
}
