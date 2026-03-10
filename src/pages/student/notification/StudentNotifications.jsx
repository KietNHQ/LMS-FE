import "./StudentNotifications.css";

export default function Notification() {

  const notifications = [
    {
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true
    },
    {
      title: "Cập nhật điểm HK1",
      content:
        "Điểm học kỳ 1 đã được cập nhật. Học sinh có thể xem điểm trên hệ thống.",
      date: "2025-01-08",
      unread: true
    },
    {
      title: "Bảo trì hệ thống",
      content:
        "Hệ thống sẽ bảo trì từ 22:00 ngày 20/01/2025 đến 6:00 ngày 21/01/2025.",
      date: "2025-01-18",
      unread: true
    }
  ];

  return (
    <div className="notification-page">

      <div className="notification-header">
        <h1>Thông báo</h1>
        <span>3 thông báo chưa đọc</span>
      </div>

      <div className="notification-list">

        {notifications.map((item, index) => (
          <div key={index} className="notification-card">

            <div className="notification-icon">
              🔔
            </div>

            <div className="notification-content">

              <div className="notification-title">
                {item.title}

                {item.unread && (
                  <span className="unread-dot"></span>
                )}
              </div>

              <p className="notification-text">
                {item.content}
              </p>

              <div className="notification-date">
                {item.date}
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}