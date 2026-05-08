import "./NotificationList.css";
import NotificationItem from "../NotificationItem/NotificationItem";

export default function NotificationList({
  notifications,
  onOpen,
  onToggleImportant,
  getClassLabel,
}) {
  return (
    <div className="parent-notification-scroll">
      {notifications.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onOpen={onOpen}
          onToggleImportant={onToggleImportant}
          getClassLabel={getClassLabel}
        />
      ))}

      {notifications.length === 0 && (
        <div className="parent-notification-list-empty">Không có thông báo để hiển thị.</div>
      )}
    </div>
  );
}


