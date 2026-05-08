export default function NotificationDialog({ notification, onClose }) {
  return (
    <div className="parent-notification-dialog-overlay" onClick={onClose}>
      <div className="parent-notification-dialog-box" onClick={(event) => event.stopPropagation()}>
        <h2>{notification.title}</h2>

        <p className="parent-notification-dialog-content">{notification.content}</p>

        <div className="parent-notification-dialog-date">{notification.date}</div>

        <button className="parent-notification-dialog-close" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}



