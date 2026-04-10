import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selected, setSelected] = useState(null);

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
    if (filter === "all") {
      return notifications.filter((notification) => isVisibleForTeacher(notification.class));
    }

    return notifications.filter((notification) => notification.class === filter);
  }, [filter, notifications, isVisibleForTeacher]);

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
        />

        <NotificationList
          notifications={filteredNotifications}
          onOpen={openNotification}
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