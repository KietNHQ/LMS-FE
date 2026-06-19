import React from "react";
import "./notificationHistorySection.css";
import { Bell, EyeOff, Pencil } from "lucide-react";

const getTypeClass = (type) => {
  if (!type) return "all";
  const t = type.toLowerCase();
  
  if (t === "tất cả") return "all";
  if (t === "giáo viên") return "teacher";
  if (t.includes("phụ huynh")) return "parent";
  if (t.includes("lớp") || t.includes("khối")) return "student";
  
  return "all";
};

const formatDate = (rawDate) => {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("vi-VN");
};

const NotificationHistorySection = ({ list, onHide, onEdit, onClickItem }) => {
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

            <div className="admin-card-actions">
              <button
                type="button"
                className="admin-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                title="Chỉnh sửa thông báo"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                className="admin-action-btn admin-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onHide(item);
                }}
                title="Ẩn thông báo"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationHistorySection;
