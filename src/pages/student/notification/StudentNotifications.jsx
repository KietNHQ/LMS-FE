import { useEffect, useMemo, useState } from "react";
import "./StudentNotifications.css";
import NotificationHeader from "./components/NotificationHeader/NotificationHeader";
import NotificationList from "./components/NotificationList/NotificationList";

const LOAD_BATCH_SIZE = 5;
const STUDENT_UNREAD_COUNT_KEY = "student_unread_notifications_count";

export default function StudentNotifications() {

  useEffect(() => {
    document.documentElement.classList.add("notifications-no-browser-scroll");
    document.body.classList.add("notifications-no-browser-scroll");

    return () => {
      document.documentElement.classList.remove("notifications-no-browser-scroll");
      document.body.classList.remove("notifications-no-browser-scroll");
    };
  }, []);

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
        "Nhà trường thông báo lịch thi học kỳ 2 năm học 2024-2025. Thi bắt đầu từ ngày 20/05/2025.",
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
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LOAD_BATCH_SIZE);

  const unreadCount = notifications.filter(n => n.unread).length;
  const markedCount = useMemo(
    () => notifications.filter((n) => n.important).length,
    [notifications]
  );

  useEffect(() => {
    localStorage.setItem(STUDENT_UNREAD_COUNT_KEY, String(unreadCount));
    window.dispatchEvent(
      new CustomEvent("student-notification-count-updated", {
        detail: unreadCount,
      })
    );
  }, [unreadCount]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (!showOnlyMarked) {
      return sortedNotifications;
    }

    return sortedNotifications.filter((item) => item.important);
  }, [sortedNotifications, showOnlyMarked]);

  const visibleNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount);
  }, [filteredNotifications, visibleCount]);

  const hasMore = visibleNotifications.length < filteredNotifications.length;

  useEffect(() => {
    setVisibleCount(LOAD_BATCH_SIZE);
  }, [showOnlyMarked]);

  const loadMoreNotifications = () => {
    if (!hasMore) return;

    setVisibleCount((prev) => Math.min(prev + LOAD_BATCH_SIZE, filteredNotifications.length));
  };

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

    setPriorityCounter(newCounter);
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

  return (
    <div className="notification-page">

      <div className="notification-container">

        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          showOnlyMarked={showOnlyMarked}
          onToggleMarkedFilter={() => setShowOnlyMarked((prev) => !prev)}
          markedCount={markedCount}
        />

        <NotificationList
          notifications={visibleNotifications}
          onOpen={openNotification}
          onToggleImportant={toggleImportant}
          hasMore={hasMore}
          onLoadMore={loadMoreNotifications}
          isFiltered={showOnlyMarked}
        />

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