import "./NotificationList.css";

export default function NotificationList({
  notifications,
  openNotification,
  getClassLabel
}) {

  return (
    <div className="notification-scroll">

      {notifications.map((item) => (

        <div
          key={item.id}
          className="notification-card"
        >

          <div
            className="notification-body"
            onClick={() => openNotification(item)}
          >

            <div className="notification-icon">
              🔔
            </div>

            <div className="notification-content">

              <div className="notification-title">

                {item.title}

                {item.unread && (
                  <span className="unread-dot"></span>
                )}

                <span className="class-badge">
                  {getClassLabel(item.class)}
                </span>

              </div>

              <p className="notification-text">
                {item.content}
              </p>

              <div className="notification-date">
                {item.date}
              </div>

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}