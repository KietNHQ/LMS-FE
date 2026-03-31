import { Bell } from "lucide-react";
import "./NotificationItem.css";

function formatNotificationDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationItem({ item, onOpen, getClassLabel }) {
  return (
    <div className={`teacher-notification-card ${item.unread ? "is-unread" : ""}`} onClick={() => onOpen(item)}>
      <div className="teacher-notification-body">
        <div className="teacher-notification-icon">
          <Bell size={18} />
        </div>

        <div className="teacher-notification-content">
          <div className="teacher-notification-title">
            {item.title}
            {item.unread && <span className="teacher-notification-unread-dot" />}
            <span className="teacher-notification-class-badge">{getClassLabel(item.class)}</span>
          </div>

          <p className="teacher-notification-text">{item.content}</p>

          <div className="teacher-notification-date">{formatNotificationDate(item.date)}</div>
        </div>
      </div>
    </div>
  );
}

