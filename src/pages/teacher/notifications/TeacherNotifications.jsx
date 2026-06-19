import { useEffect, useMemo, useState } from "react";
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
const TEACHER_HIDDEN_NOTIFICATION_IDS_KEY = "teacher_hidden_notification_ids";
const IMPORTANT_PRIORITIES = new Set(["high", "urgent", "important"]);

const readHiddenNotificationIds = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(TEACHER_HIDDEN_NOTIFICATION_IDS_KEY) || "[]");
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
};

const saveHiddenNotificationIds = (ids) => {
  localStorage.setItem(TEACHER_HIDDEN_NOTIFICATION_IDS_KEY, JSON.stringify([...ids]));
};

const isNotificationImportant = (notification = {}) => {
  if (notification.is_important !== undefined) return Boolean(notification.is_important);
  if (notification.important !== undefined) return Boolean(notification.important);
  return IMPORTANT_PRIORITIES.has(String(notification.priority ?? "").toLowerCase());
};

export default function TeacherNotifications() {
  const [filter, setFilter] = useState("all");
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await teacherService.getNotifications({ mock: false });
        if (response.success && response.data) {
          const hiddenIds = new Set(readHiddenNotificationIds());
          const mapped = response.data.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            date: n.sent_at || n.created_at || n.date,
            unread: n.unread === true || n.is_read === false || n.status === "unread",
            class: n.target_type === "class" || n.class === "class" ? "class" : "system",
            important: isNotificationImportant(n),
          })).filter((item) => !hiddenIds.has(String(item.id)));
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

  const markAllRead = async () => {
    const previousNotifications = notifications;
    const updated = notifications.map((notification) => ({
      ...notification,
      unread: false,
    }));
    setNotifications(updated);

    try {
      await teacherService.markAllNotificationsRead({ mock: false });
    } catch (error) {
      console.error("Failed to mark teacher notifications as read:", error);
      setNotifications(previousNotifications);
    }
  };

  const openNotification = async (item) => {
    const updated = notifications.map((notification) =>
      notification.id === item.id ? { ...notification, unread: false } : notification
    );

    setNotifications(updated);
    setSelected({ ...item, unread: false });

    if (item.unread) {
      try {
        await teacherService.markNotificationRead({
          pathParams: { id: item.id },
          mock: false,
        });
      } catch (error) {
        console.error("Failed to mark teacher notification as read:", error);
      }
    }
  };

  const closeDialog = () => {
    setSelected(null);
  };

  const toggleImportant = async (id) => {
    const previousNotifications = notifications;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, important: !n.important } : n))
    );

    try {
      await teacherService.toggleNotificationImportant({
        pathParams: { id },
        mock: false,
      });
    } catch (error) {
      console.error("Failed to toggle teacher notification important flag:", error);
      setNotifications(previousNotifications);
    }
  };

  const markNotificationReadById = async (id) => {
    await teacherService.markNotificationRead({
      pathParams: { id },
      mock: false,
    });
  };

  const hideNotification = async (item) => {
    const hiddenIds = new Set(readHiddenNotificationIds());
    hiddenIds.add(String(item.id));
    saveHiddenNotificationIds(hiddenIds);

    setNotifications((prev) => prev.filter((notification) => notification.id !== item.id));
    if (selected?.id === item.id) {
      setSelected(null);
    }

    if (item.unread) {
      try {
        await markNotificationReadById(item.id);
      } catch (error) {
        console.warn("Failed to mark hidden teacher notification as read:", error);
      }
    }
  };

  const hideVisibleNotifications = async () => {
    if (filteredNotifications.length === 0) return;

    const hiddenIds = new Set(readHiddenNotificationIds());
    filteredNotifications.forEach((item) => hiddenIds.add(String(item.id)));
    saveHiddenNotificationIds(hiddenIds);

    const hiddenIdSet = new Set(filteredNotifications.map((item) => item.id));
    setNotifications((prev) => prev.filter((item) => !hiddenIdSet.has(item.id)));
    if (selected && hiddenIdSet.has(selected.id)) {
      setSelected(null);
    }

    await Promise.allSettled(
      filteredNotifications
        .filter((item) => item.unread)
        .map((item) => markNotificationReadById(item.id))
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
          onHideVisible={hideVisibleNotifications}
          hideVisibleDisabled={filteredNotifications.length === 0}
        />

        <NotificationList
          notifications={filteredNotifications}
          onOpen={openNotification}
          onToggleImportant={toggleImportant}
          onHide={hideNotification}
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
