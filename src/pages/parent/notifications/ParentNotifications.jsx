import { useCallback, useEffect, useMemo, useState } from "react";
import "./ParentNotifications.css";

import NotificationHeader from "./components/NotificationHeader/NotificationHeader";
import NotificationDialog from "./components/NotificationDialog/NotificationDialog";
import NotificationList from "./components/NotificationList/NotificationList";

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
    class: "parent",
  },
];

const CLASS_LABELS = {
  "10": "Lớp 10",
  "11": "Lớp 11",
  "12": "Lớp 12",
  parent: "Phụ huynh",
};

const PARENT_UNREAD_COUNT_KEY = "parent_unread_notifications_count";
const PARENT_UNREAD_COUNT_EVENT = "parent-notification-count-updated";

export default function ParentNotifications() {


  const studentClasses = useMemo(
    () => [...new Set(CHILDREN.map((child) => child.class.slice(0, 2)))],
    []
  );

  const [filter, setFilter] = useState("all");
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selected, setSelected] = useState(null);

  const markedCount = useMemo(
    () => notifications.filter((n) => n.important).length,
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  useEffect(() => {
    localStorage.setItem(PARENT_UNREAD_COUNT_KEY, String(unreadCount));
    window.dispatchEvent(
      new CustomEvent(PARENT_UNREAD_COUNT_EVENT, {
        detail: unreadCount,
      })
    );
  }, [unreadCount]);

  const isVisibleForParent = useCallback((targetClass) => {
    return (
      studentClasses.includes(targetClass) ||
      targetClass === "parent" ||
      targetClass === "12"
    );
  }, [studentClasses]);

  const classList = useMemo(() => {
    return [
      ...new Set(
        notifications
          .map((notification) => notification.class)
          .filter((targetClass) => isVisibleForParent(targetClass))
      ),
    ];
  }, [notifications, isVisibleForParent]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (filter === "all") {
      result = result.filter((notification) => isVisibleForParent(notification.class));
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
  }, [filter, notifications, isVisibleForParent, showOnlyMarked]);

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

  return(

    <div className="parent-notification-page">

      <div className="parent-notification-container">

        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          filter={filter}
          setFilter={setFilter}
          classList={classList}
          getClassLabel={getClassLabel}
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

    </div>
  );
}