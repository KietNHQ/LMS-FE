import "./NotificationList.css";
import NotificationItem from "../NotificationItem/NotificationItem";

export default function NotificationList({
  notifications,
  onOpen,
  getClassLabel,
}) {
  return (
    <div className="teacher-notification-scroll">
      {notifications.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onOpen={onOpen}
          getClassLabel={getClassLabel}
        />
      ))}

      {notifications.length === 0 && (
        <div className="teacher-notification-list-empty">Không có thông báo để hiển thị.</div>
      )}
    </div>
  );
}
