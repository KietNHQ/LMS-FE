import { Bell } from "lucide-react";
import "./NotificationItem.css";

function formatNotificationDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationItem({ item, onOpen, getClassLabel }) {
  return (
    <div className={`parent-notification-card ${item.unread ? "is-unread" : ""}`} onClick={() => onOpen(item)}>
      <div className="parent-notification-body">
        <div className="parent-notification-icon">
          <Bell size={18} />
        </div>

        <div className="parent-notification-content">
          <div className="parent-notification-title">
            {item.title}
            {item.unread && <span className="parent-notification-unread-dot" />}
            <span className="parent-notification-class-badge">{getClassLabel(item.class)}</span>
          </div>

          <p className="parent-notification-text">{item.content}</p>

          <div className="parent-notification-date">{formatNotificationDate(item.date)}</div>
        </div>
      </div>
    </div>
  );
}

