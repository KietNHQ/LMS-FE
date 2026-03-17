import { Bell, Star } from "lucide-react";
import "./NotificationItem.css";

export default function NotificationItem({ item, onOpen, onToggleImportant }) {
    return (
        <div className="notification-card">
            <div className="notification-body" onClick={() => onOpen(item)}>
                <div className="notification-icon-student">
                        <Bell size={20}/>
                </div>
                <div className="notification-content">
                    <div className="notification-title">
                        {item.title}
                        {item.unread && <span className="unread-dot-student" />}
                    </div>

                    <p className="notification-text">{item.content}</p>

                    <div className="notification-date">{item.date}</div>
                </div>
            </div>

            <div className="star-box" onClick={() => onToggleImportant(item.id)}>
                <Star
                    className={item.important ? "star-active" : "star"}
                    fill={item.important ? "currentColor" : "none"}
                />
            </div>
        </div>
    );
}
