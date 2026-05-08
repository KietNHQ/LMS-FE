import { useEffect, useMemo, useState } from "react";
import "./StudentNotifications.css";
import NotificationHeader from "./components/NotificationHeader/NotificationHeader";
import NotificationList from "./components/NotificationList/NotificationList";
import { notificationService } from "../../../services/pages/student/notifications";

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

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LOAD_BATCH_SIZE);

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const hasAuth = !!localStorage.getItem("accessToken");
        if (!hasAuth) {
          localStorage.setItem(STUDENT_UNREAD_COUNT_KEY, "0");
          window.dispatchEvent(
            new CustomEvent("student-notification-count-updated", {
              detail: 0,
            })
          );
          setError("Bạn cần đăng nhập để xem thông báo.");
          setIsLoading(false);
          return;
        }

        const [listResponse, unreadResponse] = await Promise.all([
          notificationService.listNotifications({ 
            params: { page: 1, limit: 100 },
            mock: false 
          }),
          notificationService.getUnreadCount({ mock: false }),
        ]);

        if (cancelled) return;

        if (listResponse?.success === false) {
          setError(listResponse.message || "Không thể lấy dữ liệu thông báo từ máy chủ.");
          setNotifications([]);
          return;
        }

        const apiNotifications = Array.isArray(listResponse?.data) ? listResponse.data : [];
        setNotifications(apiNotifications);

        const unreadCountFromApi = unreadResponse?.unreadCount ?? listResponse?.unreadCount ?? apiNotifications.filter((item) => item.unread).length;
        localStorage.setItem(STUDENT_UNREAD_COUNT_KEY, String(unreadCountFromApi));
        window.dispatchEvent(
          new CustomEvent("student-notification-count-updated", {
            detail: unreadCountFromApi,
          })
        );
      } catch (fetchError) {
        if (!cancelled) {
          console.error("Lỗi API thông báo:", fetchError);
          setError("Không thể lấy thông báo. Vui lòng kiểm tra kết nối.");
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    return [...new Set(notifications.map(n => n.category).filter(Boolean))];
  }, [notifications]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const markedCount = useMemo(
    () => notifications.filter((n) => n.important).length,
    [notifications]
  );

  useEffect(() => {
    if (isLoading || error) return;

    localStorage.setItem(STUDENT_UNREAD_COUNT_KEY, String(unreadCount));
    window.dispatchEvent(
      new CustomEvent("student-notification-count-updated", {
        detail: unreadCount,
      })
    );
  }, [unreadCount, isLoading, error]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      // Important first
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;

      // Then by date descending
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let result = sortedNotifications;

    if (filter !== "all") {
      result = result.filter(n => n.category === filter);
    }

    if (showOnlyMarked) {
      result = result.filter((item) => item.important);
    }

    return result;
  }, [sortedNotifications, showOnlyMarked, filter]);

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

  const markAllRead = async () => {
    const previousNotifications = notifications;
    const updated = notifications.map((n) => ({
      ...n,
      unread: false,
    }));

    setNotifications(updated);

    try {
      const hasAuth = !!localStorage.getItem("accessToken");
      await notificationService.markAllNotificationsRead({ mock: !hasAuth });
    } catch (markError) {
      console.error("Không thể đánh dấu tất cả là đã đọc:", markError);
      setNotifications(previousNotifications);
      setError(markError?.message || "Không thể cập nhật trạng thái thông báo");
    }
  };

  const toggleImportant = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, important: !item.important } : item
      )
    );
  };

  const openNotification = async (item) => {
    const nextItem = { ...item, unread: false };

    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? nextItem : n))
    );
    setSelected(nextItem);

    try {
      const hasAuth = !!localStorage.getItem("accessToken");
      await notificationService.markNotificationRead(item.id, { mock: !hasAuth });
    } catch (readError) {
      console.error("Không thể đánh dấu thông báo đã đọc:", readError);
      setError(readError?.message || "Không thể cập nhật thông báo");
    }
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
          filter={filter}
          setFilter={setFilter}
          categories={categories}
          showOnlyMarked={showOnlyMarked}
          onToggleMarkedFilter={() => setShowOnlyMarked((prev) => !prev)}
          markedCount={markedCount}
        />

        {isLoading ? (
          <div className="notification-list-empty">Đang tải thông báo...</div>
        ) : error && notifications.length === 0 ? (
          <div className="notification-list-empty">{error}</div>
        ) : (
          <NotificationList
            notifications={visibleNotifications}
            onOpen={openNotification}
            onToggleImportant={toggleImportant}
            hasMore={hasMore}
            onLoadMore={loadMoreNotifications}
            isFiltered={showOnlyMarked}
          />
        )}

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
