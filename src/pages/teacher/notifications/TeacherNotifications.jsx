import { useCallback, useEffect, useMemo, useState } from "react";
import teacherService from "../../../services/pages/teacher/teacherService";
import "./TeacherNotifications.css";

import NotificationHeader from "./components/NotificationHeader/NotificationHeader";
import NotificationDialog from "./components/NotificationDialog/NotificationDialog";
import NotificationList from "./components/NotificationList/NotificationList";
import CreateNotificationForm from "./components/CreateNotificationForm/CreateNotificationForm";

const CHILDREN = [
  { name: "Nguyen Van B", class: "10A1" },
  { name: "Nguyen Van C", class: "11A2" },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Lịch thi HK2",
    content: "Thi bắt đầu từ ngày 20/05/2025",
    date: "2025-01-15",
    unread: true,
    class: "10",
  },
  {
    id: 2,
    title: "Cập nhật điểm",
    content: "Điểm học kỳ đã cập nhật",
    date: "2025-01-08",
    unread: true,
    class: "11",
  },
  {
    id: 3,
    title: "Thông báo hệ thống",
    content: "Bảo trì hệ thống LMS",
    date: "2025-01-18",
    unread: true,
    class: "12",
  },
  {
    id: 4,
    title: "Họp phụ huynh",
    content: "Nhà trường tổ chức họp phụ huynh",
    date: "2025-01-20",
    unread: true,
    class: "teacher",
  },
];

const CLASS_LABELS = {
  "10": "Lớp 10",
  "11": "Lớp 11",
  "12": "Lớp 12",
  teacher: "Giáo viên",
};

const TEACHER_UNREAD_COUNT_KEY = "teacher_unread_notifications_count";
const TEACHER_UNREAD_COUNT_EVENT = "teacher-notification-count-updated";

export default function TeacherNotifications() {
  const studentClasses = useMemo(
    () => [...new Set(CHILDREN.map((child) => child.class.slice(0, 2)))],
    []
  );

  const [filter, setFilter] = useState("all");
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await teacherService.getNotifications({ mock: false });
        if (response.success && response.data) {
          const mapped = response.data.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            date: n.created_at || n.date,
            unread: n.unread === true || n.is_read === false || n.status === "unread",
            class: n.type || n.class || "teacher",
            important: n.is_important || n.important || false
          }));
          setNotifications(mapped);
          console.log("Teacher Notifications loaded from real API:", mapped.length, "items");
        } else {
          // If response is success but data is empty, it's real empty data
          setNotifications([]);
        }
      } catch (error) {
        console.error("Failed to fetch real notifications:", error);
        // Do not fallback to mock data, let the user know it's empty/error
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markedCount = useMemo(
    () => notifications.filter((n) => n.important).length,
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  useEffect(() => {
    localStorage.setItem(TEACHER_UNREAD_COUNT_KEY, String(unreadCount));
    window.dispatchEvent(
      new CustomEvent(TEACHER_UNREAD_COUNT_EVENT, {
        detail: unreadCount,
      })
    );
  }, [unreadCount]);

  const isVisibleForTeacher = useCallback((targetClass) => {
    return (
      studentClasses.includes(targetClass) ||
      targetClass === "teacher" ||
      targetClass === "12"
    );
  }, [studentClasses]);

  const classList = useMemo(() => {
    return [
      ...new Set(
        notifications
          .map((notification) => notification.class)
          .filter((targetClass) => isVisibleForTeacher(targetClass))
      ),
    ];
  }, [notifications, isVisibleForTeacher]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (filter === "all") {
      result = result.filter((notification) => isVisibleForTeacher(notification.class));
    } else {
      result = result.filter((notification) => notification.class === filter);
    }

    if (showOnlyMarked) {
      result = result.filter((notification) => notification.important);
    }

    // Sort by important first, then by date descending
    return [...result].sort((a, b) => {
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Newest first
    });
  }, [filter, notifications, isVisibleForTeacher, showOnlyMarked]);

  const getClassLabel = (targetClass) => {
    return CLASS_LABELS[targetClass] || "";
  };

  const markAllRead = () => {
    const updated = notifications.map((notification) => ({
      ...notification,
      unread: false,
    }));
    setNotifications(updated);
  };

  const openNotification = (item) => {
    const updated = notifications.map((notification) =>
      notification.id === item.id ? { ...notification, unread: false } : notification
    );

    setNotifications(updated);
    setSelected({ ...item, unread: false });
  };

  const closeDialog = () => {
    setSelected(null);
  };

  const toggleImportant = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, important: !n.important } : n))
    );
  };

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return(

    <div className="teacher-notification-page">

      <div className="teacher-notification-container">

        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          filter={filter}
          setFilter={setFilter}
          classList={classList}
          getClassLabel={getClassLabel}
          onOpenCompose={() => setIsComposeOpen(true)}
          showOnlyMarked={showOnlyMarked}
          onToggleMarkedFilter={() => setShowOnlyMarked(!showOnlyMarked)}
          markedCount={markedCount}
        />

        <NotificationList
          notifications={filteredNotifications}
          onOpen={openNotification}
          onToggleImportant={toggleImportant}
          getClassLabel={getClassLabel}
        />

      </div>

      {selected && <NotificationDialog notification={selected} onClose={closeDialog} />}

      {isComposeOpen && (
        <div className="teacher-notification-dialog-overlay" onClick={() => setIsComposeOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CreateNotificationForm onClose={() => setIsComposeOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
