import { useState } from "react";
import "./StudentNotifications.css";

export default function Notification() {

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false
    },
    {
      id: 2,
      title: "Cập nhật điểm HK1",
      content:
        "Điểm học kỳ 1 đã được cập nhật. Học sinh có thể xem điểm trên hệ thống.",
      date: "2025-01-08",
      unread: true,
      important: false
    },
    {
      id: 3,
      title: "Bảo trì hệ thống",
      content:
        "Hệ thống sẽ bảo trì từ 22:00 ngày 20/01/2025 đến 6:00 ngày 21/01/2025.",
      date: "2025-01-18",
      unread: true,
      important: false
    },
    {
      id: 4,
      title: "Thông báo học phí",
      content:
        "Sinh viên cần hoàn thành đóng học phí trước ngày 10/02/2025.",
      date: "2025-01-20",
      unread: true,
      important: false
    }
  ]);

  const [selected, setSelected] = useState(null);
  const [showImportant, setShowImportant] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({
      ...n,
      unread: false
    }));
    setNotifications(updated);
  };

  const toggleImportant = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, important: !n.important } : n
    );
    setNotifications(updated);
  };

  const openNotification = (item) => {

    const updated = notifications.map(n =>
      n.id === item.id ? { ...n, unread: false } : n
    );

    setNotifications(updated);
    setSelected(item);
  };

  const closeDialog = () => {
    setSelected(null);
  };

  const displayNotifications = showImportant
    ? notifications.filter(n => n.important)
    : notifications;

  return (
    <div className="notification-page">

      <div className="notification-container">

        <div className="notification-header">
          <h1>Thông báo</h1>
          <span>{unreadCount} thông báo chưa đọc</span>
        </div>


        {/* BOX CHỨA SCROLL */}

        <div className="notification-scroll">

          {displayNotifications.map((item) => (

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

                  </div>

                  <p className="notification-text">
                    {item.content}
                  </p>

                  <div className="notification-date">
                    {item.date}
                  </div>

                </div>

              </div>

              {/* CHECKBOX QUAN TRỌNG */}

              <div className="important-box">

                <input
                  type="checkbox"
                  checked={item.important}
                  onChange={() => toggleImportant(item.id)}
                />

              </div>

            </div>

          ))}

        </div>


        {/* BUTTONS */}

        <div className="notification-actions">

          <button
            className="important-btn"
            onClick={() => setShowImportant(!showImportant)}
          >
            Quan trọng
          </button>

          <button
            className="mark-read-btn"
            onClick={markAllRead}
          >
            Đọc hết
          </button>

        </div>

      </div>


      {/* DIALOG */}

      {selected && (

        <div className="dialog-overlay" onClick={closeDialog}>

          <div
            className="dialog-box"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>{selected.title}</h2>

            <p className="dialog-content">
              {selected.content}
            </p>

            <div className="dialog-date">
              {selected.date}
            </div>

            <button
              className="dialog-close"
              onClick={closeDialog}
            >
              Đóng
            </button>

          </div>

        </div>

      )}

    </div>
  );
}