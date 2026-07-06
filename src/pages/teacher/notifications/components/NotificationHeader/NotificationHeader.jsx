import { Bell, EyeOff, Star } from "lucide-react";
import NotificationFilter from "../NotificationFilter/NotificationFilter";
import "./NotificationHeader.css";

export default function NotificationHeader({
  unreadCount,
  onMarkAllRead,
  filter,
  setFilter,
  classList,
  getClassLabel,
  onOpenCompose,
  showOnlyMarked = false,
  onToggleMarkedFilter,
  markedCount = 0,
  onHideVisible,
  hideVisibleDisabled = false,
}) {
  return (
    <div className="teacher-notification-header">
      <div className="teacher-notification-header-left">
        <div className="teacher-notification-header__title">
          <h1>Thông báo</h1>
          <span>{unreadCount} thông báo chưa đọc</span>
        </div>

        <NotificationFilter
          filter={filter}
          setFilter={setFilter}
          classList={classList}
          getClassLabel={getClassLabel}
        />
      </div>

      <div className="teacher-notification-header-right">
        <div className="teacher-notification-header-buttons">
          <button
            type="button"
            className={`teacher-marked-filter-btn ${showOnlyMarked ? "is-active" : ""}`}
            onClick={onToggleMarkedFilter}
            title={showOnlyMarked ? "Hiển thị tất cả" : "Chỉ hiển thị đã đánh dấu"}
          >
            <Star size={16} fill={showOnlyMarked ? "currentColor" : "none"} />
            <span>{showOnlyMarked ? "Đang lọc đã đánh dấu" : "Lọc đã đánh dấu"}</span>
            <strong>{markedCount}</strong>
          </button>

          <button className="teacher-notification-btn-primary" onClick={onOpenCompose}>
            + Soạn tin
          </button>

          <div className="teacher-notification-bell" onClick={onMarkAllRead} role="button" tabIndex={0}>
            <Bell className="teacher-notification-bell-icon" size={22} />
            {unreadCount > 0 && (
              <span className="teacher-notification-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </div>

          <button
            type="button"
            className="teacher-notification-hide-btn"
            onClick={onHideVisible}
            disabled={hideVisibleDisabled}
            title="Ẩn thông báo đang hiển thị"
          >
            <EyeOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}



