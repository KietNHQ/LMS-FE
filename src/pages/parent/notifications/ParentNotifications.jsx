import { useCallback, useEffect, useMemo, useState } from "react";
import "./ParentNotifications.css";
import NotificationHeader from "./components/NotificationHeader/NotificationHeader";
import NotificationDialog from "./components/NotificationDialog/NotificationDialog";
import NotificationList from "./components/NotificationList/NotificationList";
import { parentService } from "../../../services/pages/parent/parentService";

const CLASS_LABELS = {
  "10": "Lớp 10",
  "11": "Lớp 11",
  "12": "Lớp 12",
  parent: "Phụ huynh",
};

const PARENT_UNREAD_COUNT_KEY = "parent_unread_notifications_count";
const PARENT_UNREAD_COUNT_EVENT = "parent-notification-count-updated";

export default function ParentNotifications() {


  // [CẢI TIẾN] Lấy danh sách khối lớp của con thực tế từ localStorage
  const studentClasses = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const localChildren = storedUser?.profile?.linkedStudents || 
                         storedUser?.linkedStudentIds || [];
    
    return [...new Set(localChildren.map((child) => {
      const cls = child.className || child.class_name || "";
      return cls.slice(0, 2); // Ví dụ "10A1" -> "10"
    }))].filter(Boolean);
  }, []);

  const [filter, setFilter] = useState("all");
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // [MỚI] Fetch thông báo từ API thực tế
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await parentService.listNotifications({ mock: false });
        
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
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
    localStorage.setItem(PARENT_UNREAD_COUNT_KEY, String(unreadCount));
    window.dispatchEvent(
      new CustomEvent(PARENT_UNREAD_COUNT_EVENT, {
        detail: unreadCount,
      })
    );
  }, [unreadCount]);

  const isVisibleForParent = useCallback((targetClass) => {
    return (
      targetClass === "parent" ||
      studentClasses.includes(targetClass) ||
      filter === "all"
    );
  }, [studentClasses, filter]);

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

    if (filter !== "all") {
      result = result.filter((notification) => notification.class === filter);
    }

    if (showOnlyMarked) {
      result = result.filter((notification) => notification.important);
    }

    return [...result].sort((a, b) => {
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;

      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [filter, notifications, showOnlyMarked]);

  const getClassLabel = (targetClass) => {
    return CLASS_LABELS[targetClass] || targetClass;
  };

  const markAllRead = async () => {
    try {
      await parentService.markAllNotificationsRead({ mock: false });
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error("❌ Error marking all read:", err);
    }
  };

  const openNotification = async (item) => {
    try {
      if (item.unread) {
        await parentService.markNotificationRead({ 
          pathParams: { id: item.id },
          mock: false 
        });
      }
      
      const updated = notifications.map((notification) =>
        notification.id === item.id ? { ...notification, unread: false } : notification
      );

      setNotifications(updated);
      setSelected({ ...item, unread: false });
    } catch (err) {
      console.error("❌ Error opening notification:", err);
      setSelected(item);
    }
  };

  const closeDialog = () => {
    setSelected(null);
  };

  const toggleImportant = async (id) => {
    try {
      await parentService.toggleNotificationImportant({
        pathParams: { id },
        mock: false
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, important: !n.important } : n))
      );
    } catch (err) {
      console.error("❌ Error toggling important:", err);
    }
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
