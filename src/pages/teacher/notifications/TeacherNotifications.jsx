import { useCallback, useEffect, useMemo, useState } from "react";
import teacherService from "../../../services/pages/teacher/teacherService";
import "./TeacherNotifications.css";

import NotificationHeader from "./components/NotificationHeader/NotificationHeader";
import NotificationDialog from "./components/NotificationDialog/NotificationDialog";
import NotificationList from "./components/NotificationList/NotificationList";
import CreateNotificationForm from "./components/CreateNotificationForm/CreateNotificationForm";

const CLASS_LABELS = {
  system: "Hộp thư chung",
  class: "Thông báo lớp",
};

const TEACHER_UNREAD_COUNT_KEY = "teacher_unread_notifications_count";
const TEACHER_UNREAD_COUNT_EVENT = "teacher-notification-count-updated";

export default function TeacherNotifications() {
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
            class: n.target_type === "class" || n.class === "class" ? "class" : "system",
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

  const classList = useMemo(() => {
    return ["system", "class"];
  }, []);

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (filter !== "all") {
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
  }, [filter, notifications, showOnlyMarked]);

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
