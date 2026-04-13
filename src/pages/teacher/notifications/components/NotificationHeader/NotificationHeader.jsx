import { Bell } from "lucide-react";
import NotificationFilter from "../NotificationFilter/NotificationFilter";
import "./NotificationHeader.css";

export default function NotificationHeader({
  unreadCount,
  onMarkAllRead,
  filter,
  setFilter,
  classList,
  getClassLabel,
  onOpenCompose
}) {
  return (
    <div className="teacher-notification-header">
      <div className="teacher-notification-header__title">
        <h1>Thông báo</h1>
        <span>{unreadCount} thông báo chưa đọc</span>
      </div>

      <div className="teacher-notification-header__actions">
        <NotificationFilter
          filter={filter}
          setFilter={setFilter}
          classList={classList}
          getClassLabel={getClassLabel}
        />

        <div className="teacher-notification-header-buttons">
          <button className="teacher-notification-btn-primary" onClick={onOpenCompose}>
            + Soạn tin
          </button>

          <div className="teacher-notification-bell" onClick={onMarkAllRead} role="button" tabIndex={0}>
            <Bell className="teacher-notification-bell-icon" size={22} />
            {unreadCount > 0 && (
              <span className="teacher-notification-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



