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
const PARENT_HIDDEN_NOTIFICATION_IDS_KEY = "parent_hidden_notification_ids";

const readHiddenNotificationIds = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(PARENT_HIDDEN_NOTIFICATION_IDS_KEY) || "[]");
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
};

const saveHiddenNotificationIds = (ids) => {
  localStorage.setItem(PARENT_HIDDEN_NOTIFICATION_IDS_KEY, JSON.stringify([...ids]));
};

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
        console.log("🔄 [ParentNotifications] Fetching from API...");
        
        const response = await parentService.listNotifications({ mock: false });
        
        console.log("📥 [ParentNotifications] API Response:", response);
        console.log("📥 [ParentNotifications] Response structure:", {
          success: response?.success,
          data: response?.data,
          isArray: Array.isArray(response?.data)
        });
        
        if (response.success && response.data) {
          console.log("✅ [ParentNotifications] Setting notifications:", response.data.length);
          const hiddenIds = new Set(readHiddenNotificationIds());
          setNotifications(response.data.filter((item) => !hiddenIds.has(String(item.id))));
        } else {
          console.warn("⚠️ [ParentNotifications] Invalid response or no data");
        }
      } catch (err) {
        console.error("❌ [ParentNotifications] Error fetching notifications:", err);
        console.error("❌ [ParentNotifications] Error response:", err?.response?.data);
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
      console.log("🔄 [ParentNotifications] Marking all as read...");
      await parentService.markAllNotificationsRead({ mock: false });
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      console.log("✅ [ParentNotifications] All marked as read");
    } catch (err) {
      console.error("❌ [ParentNotifications] Error marking all read:", err);
    }
  };

  const openNotification = async (item) => {
    try {
      if (item.unread) {
        console.log(`🔄 [ParentNotifications] Marking notification ${item.id} as read...`);
        await parentService.markNotificationRead({ 
          pathParams: { id: item.id },
          mock: false 
        });
        console.log(`✅ [ParentNotifications] Notification ${item.id} marked as read`);
      }
      
      const updated = notifications.map((notification) =>
        notification.id === item.id ? { ...notification, unread: false } : notification
      );

      setNotifications(updated);
      setSelected({ ...item, unread: false });
    } catch (err) {
      console.error("❌ [ParentNotifications] Error opening notification:", err);
      setSelected(item);
    }
  };

  const closeDialog = () => {
    setSelected(null);
  };

  const toggleImportant = async (id) => {
    try {
      console.log(`🔄 [ParentNotifications] Toggling important for notification ${id}...`);
      await parentService.toggleNotificationImportant({
        pathParams: { id },
        mock: false
      });
      console.log(`✅ [ParentNotifications] Toggled important for ${id}`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, important: !n.important } : n))
      );
    } catch (err) {
      console.error("❌ [ParentNotifications] Error toggling important:", err);
    }
  };

  const markNotificationReadById = async (id) => {
    await parentService.markNotificationRead({
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
      } catch (err) {
        console.warn("❌ [ParentNotifications] Error marking hidden notification read:", err);
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
          onHideVisible={hideVisibleNotifications}
          hideVisibleDisabled={filteredNotifications.length === 0}
        />

        {isLoading ? (
          <div className="parent-notification-list-empty">Đang tải thông báo...</div>
        ) : (
          <NotificationList
            notifications={filteredNotifications}
            onOpen={openNotification}
            onToggleImportant={toggleImportant}
            onHide={hideNotification}
            getClassLabel={getClassLabel}
          />
        )}

      </div>

      {selected && <NotificationDialog notification={selected} onClose={closeDialog} />}

    </div>
  );
}
