import React from "react";
import "./notificationHistorySection.css";
import { Bell, Trash2 } from "lucide-react";

const getTypeClass = (type) => {
  switch (type) {
    case "Tất cả":
      return "all";
    case "Lớp 10":
      return "grade10";
    case "Lớp 11":
      return "grade11";
    case "Lớp 12":
      return "grade12";
    case "Giáo viên":
      return "teacher";
    case "Học sinh":
      return "student";
    case "Phụ huynh":
      return "parent";
    default:
      return "all";
  }
};

const formatDate = (rawDate) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("vi-VN");
};

const NotificationHistorySection = ({ list, onDelete, onClickItem }) => {
  if (!list.length) {
    return <div className="admin-list-empty">Không có thông báo phù hợp bộ lọc.</div>;
  }

  return (
    <div className="admin-list">
      {list.map((item) => {
        const typeClass = getTypeClass(item.type);
        const displayDate = formatDate(item.date);

        return (
          <div
            key={item.id}
            className={`admin-card ${typeClass} ${item.read ? "" : "is-unread"}`.trim()}
            onClick={() => onClickItem(item)}
          >
            <div className={`admin-icon ${typeClass}`}>
              <Bell size={18} />
            </div>

            <div className="admin-content">
              <h4 className="admin-title">
                {item.title}
                {!item.read && <span className={`unread-dot ${typeClass}`} />}
              </h4>

              <p>{item.content}</p>

              <div className="admin-meta">
                <span className={`tag ${typeClass}`}>{item.type}</span>
                <span>{displayDate}</span>
              </div>
            </div>

            <button
              type="button"
              className="admin-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              title="Xóa thông báo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationHistorySection;