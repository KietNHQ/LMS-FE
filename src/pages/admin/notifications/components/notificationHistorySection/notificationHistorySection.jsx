import React from "react";
import "./notificationHistorySection.css";
import { Bell, Trash2 } from "lucide-react";

const getTypeClass = (type) => {
  switch (type) {
    case "Tất cả":
      return "all";
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

const NotificationHistorySection = ({ list, onDelete, onClickItem }) => {
  return (
    <div className="admin-list">
      {list.map((item) => {
        const typeClass = getTypeClass(item.type);

        return (
          <div
            key={item.id}
            className={`admin-card ${typeClass}`}
            onClick={() => onClickItem(item)}
          >
            {/* ICON */}
            <div className={`admin-icon ${typeClass}`}>
              <Bell size={18} />
            </div>

            {/* CONTENT */}
            <div className="admin-content">
              <h4 className="admin-title">
                {item.title}
                {!item.read && (
                  <span className={`unread-dot ${typeClass}`} />
                )}
              </h4>

              <p>{item.content}</p>

              <div className="admin-meta">
                <span className={`tag ${typeClass}`}>
                  {item.type}
                </span>
                <span>{item.date}</span>
              </div>
            </div>

            {/* DELETE */}
            <Trash2
              className="admin-delete"
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default NotificationHistorySection;