export default function NotificationDialog({ notification, onClose }) {
  return (
    <div className="teacher-notification-dialog-overlay" onClick={onClose}>
      <div className="teacher-notification-dialog-box" onClick={(event) => event.stopPropagation()}>
        <h2>{notification.title}</h2>

        <p className="teacher-notification-dialog-content">{notification.content}</p>

        <div className="teacher-notification-dialog-date">{notification.date}</div>

        <button className="teacher-notification-dialog-close" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}



