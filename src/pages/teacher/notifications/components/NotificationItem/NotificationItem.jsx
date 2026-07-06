import { Bell, EyeOff, Star } from "lucide-react";
import "./NotificationItem.css";

function formatNotificationDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationItem({ item, onOpen, onToggleImportant, onHide, getClassLabel }) {
  return (
    <div className={`teacher-notification-card ${item.unread ? "is-unread" : ""} ${item.important ? "is-important" : ""}`}>
      <div className="teacher-notification-body" onClick={() => onOpen(item)}>
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

      <div className="teacher-notification-actions">
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

        <button
          type="button"
          className="notif-hide-box"
          onClick={(event) => {
            event.stopPropagation();
            onHide(item);
          }}
          aria-label="Ẩn thông báo"
          title="Ẩn thông báo"
        >
          <EyeOff size={18} />
        </button>
      </div>
    </div>
  );
}

