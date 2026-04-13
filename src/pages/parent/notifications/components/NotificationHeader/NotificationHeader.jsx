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
}) {
  return (
    <div className="parent-notification-header">
      <div className="parent-notification-header__title">
        <h1>Thông báo</h1>
        <span>{unreadCount} thông báo chưa đọc</span>
      </div>

      <div className="parent-notification-header__actions">
        <NotificationFilter
          filter={filter}
          setFilter={setFilter}
          classList={classList}
          getClassLabel={getClassLabel}
        />

        <div className="parent-notification-bell" onClick={onMarkAllRead} role="button" tabIndex={0}>
          <Bell className="parent-notification-bell-icon" size={22} />
          {unreadCount > 0 && (
            <span className="parent-notification-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}



