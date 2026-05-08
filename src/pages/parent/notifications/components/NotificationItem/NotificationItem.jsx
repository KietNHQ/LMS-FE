import { Bell, Star } from "lucide-react";
import "./NotificationItem.css";

function formatNotificationDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationItem({ item, onOpen, onToggleImportant, getClassLabel }) {
  return (
    <div className={`parent-notification-card ${item.unread ? "is-unread" : ""} ${item.important ? "is-important" : ""}`}>
      <div className="parent-notification-body" onClick={() => onOpen(item)}>
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

      <button
        type="button"
        className="notif-star-box"
        onClick={() => onToggleImportant(item.id)}
        aria-label={item.important ? "Bỏ đánh dấu" : "Đánh dấu quan trọng"}
        title={item.important ? "Bỏ đánh dấu" : "Đánh dấu quan trọng"}
      >
        <Star
          size={18}
          className={item.important ? "notif-star-active" : "notif-star"}
          fill={item.important ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}


