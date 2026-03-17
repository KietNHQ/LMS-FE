import { useState } from "react";
import "./StudentNotifications.css";

import { Bell, Star } from "lucide-react";

export default function Notification() {

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
    {
      id: 2,
      title: "Cập nhật điểm HK1",
      content:
        "Điểm học kỳ 1 đã được cập nhật. Học sinh có thể xem điểm trên hệ thống.",
      date: "2025-01-08",
      unread: true,
      important: false,
      priority: 0
    },
    {
      id: 3,
      title: "Bảo trì hệ thống",
      content:
        "Hệ thống sẽ bảo trì từ 22:00 ngày 20/01/2025 đến 6:00 ngày 21/01/2025.",
      date: "2025-01-18",
      unread: true,
      important: false,
      priority: 0
    },
    {
      id: 4,
      title: "Thông báo học phí",
      content:
        "Sinh viên cần hoàn thành đóng học phí trước ngày 10/02/2025.",
      date: "2025-01-20",
      unread: true,
      important: false,
      priority: 0
    },
    {
      id: 5,
      title: "Hoạt động ngoại khóa",
      content:
        "Nhà trường tổ chức hoạt động ngoại khóa vào cuối tuần này.",
      date: "2025-01-21",
      unread: true,
      important: false,
      priority: 0
    },
    {
      id: 6,
      title: "Cập nhật lịch học",
      content:
        "Một số lớp học được thay đổi lịch học trong tuần tới.",
      date: "2025-01-22",
      unread: true,
      important: false,
      priority: 0
    },
    {
      id: 7,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 8,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 9,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 10,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 11,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 12,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    }, {
      id: 13,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    }, {
      id: 14,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    }, {
      id: 15,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    }, {
      id: 16,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025,Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.,Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    }, {
      id: 17,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    }, {
      id: 18,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 19,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
     {
      id: 20,
      title: "Lịch thi HK2 2024-2025",
      content:
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
      date: "2025-01-15",
      unread: true,
      important: false,
      priority: 0
    },
  ]);

  const [priorityCounter, setPriorityCounter] = useState(1);
  const [selected, setSelected] = useState(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({
      ...n,
      unread: false
    }));
    setNotifications(updated);
  };

  const toggleImportant = (id) => {

    let newCounter = priorityCounter;

    const updated = notifications.map(n => {

      if (n.id === id) {

        if (!n.important) {
          return {
            ...n,
            important: true,
            priority: newCounter++
          };
        } else {
          return {
            ...n,
            important: false,
            priority: 0
          };
        }

      }

      return n;

    });

    const sorted = [...updated].sort((a, b) => {

      if (a.important && b.important) {
        return b.priority - a.priority;
      }

      if (a.important) return -1;
      if (b.important) return 1;

      return 0;

    });

    setPriorityCounter(newCounter);
    setNotifications(sorted);
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

  return (
    <div className="notification-page">

      <div className="notification-container">

        <div className="notification-header">

          <div>
            <h1>Thông báo</h1>
            <span>{unreadCount} thông báo chưa đọc</span>
          </div>

          <div
            className="notification-bell"
            onClick={markAllRead}
          >

            <Bell className="bell-icon-student" size={28} />
            {unreadCount > 0 && (
              <span className="bell-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

          </div>

        </div>

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

                <div className="notification-icon-student">
                <Bell size={20}/>
                </div>

                <div className="notification-content">

                  <div className="notification-title">

                    {item.title}

                    {item.unread && (
                      <span className="unread-dot-student"></span>
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

              <div
                className="star-box"
                onClick={() => toggleImportant(item.id)}
              >

                    <Star
                    className={item.important ? "star-active" : "star"}
                    fill={item.important ? "currentColor" : "none"}
              />

              </div>

            </div>

          ))}

        </div>

      </div>

      {selected && (

        <div
          className="dialog-overlay"
          onClick={closeDialog}
        >

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
              className="dialog-close-student"
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