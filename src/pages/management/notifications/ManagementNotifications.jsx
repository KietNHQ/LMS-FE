import React, { useMemo, useState, useEffect } from "react";
import { Bell, BellPlus, EyeOff } from "lucide-react";
import "./ManagementNotifications.css";
import notificationService from "../../../services/pages/management/notifications/notificationService";
import NotificationHistorySection from "./components/notificationHistorySection/notificationHistorySection";
import CreateNotificationSection from "./components/createNotificationSection/createNotificationSection";

const FILTERS = [
  "Tất cả",
  "Khối 10",
  "Khối 11",
  "Khối 12",
  "Giáo viên",
  "Phụ huynh",
];
const TARGET_OPTIONS = [
  "Tất cả",
  "Tất cả khối",
  "Lớp 10",
  "Lớp 11",
  "Lớp 12",
  "Giáo viên",
  "Phụ huynh (Tất cả)",
  "Phụ huynh Lớp 10",
  "Phụ huynh Lớp 11",
  "Phụ huynh Lớp 12",
];

const getErrorMessage = (error, fallback) => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  return apiMessage || apiError || fallback;
};

const ADMIN_UNREAD_COUNT_KEY = "admin_unread_notifications_count";
const ADMIN_UNREAD_COUNT_EVENT = "admin-notification-count-updated";
const HIDDEN_NOTIFICATION_IDS_KEY = "management_hidden_notification_ids";

const readHiddenNotificationIds = () => {
  try {
    const raw = localStorage.getItem(HIDDEN_NOTIFICATION_IDS_KEY);
    const ids = JSON.parse(raw || "[]");
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
};

const saveHiddenNotificationIds = (ids) => {
  localStorage.setItem(HIDDEN_NOTIFICATION_IDS_KEY, JSON.stringify([...ids]));
};

const ManagementNotifications = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const [list, setList] = useState([]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await notificationService.listNotifications();
      const hiddenIds = new Set(readHiddenNotificationIds());
      setList((result.items || []).filter((item) => !hiddenIds.has(String(item.id))));
    } catch (error) {
      setLoadError(
        getErrorMessage(error, "Không thể tải danh sách thông báo.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current user's notifications from API
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("admin_notifications_list", JSON.stringify(list));
  }, [list]);

  // Listen for updates from other pages
  useEffect(() => {
    const handleRefresh = () => {
      const saved = localStorage.getItem("admin_notifications_list");
      if (saved) setList(JSON.parse(saved));
    };
    window.addEventListener("admin-notifications-updated", handleRefresh);
    return () =>
      window.removeEventListener("admin-notifications-updated", handleRefresh);
  }, []);

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "Tất cả",
  });

  const sortedList = useMemo(() => {
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [list]);

  const unreadCount = useMemo(
    () => list.filter((item) => !item.read).length,
    [list]
  );

  // Đồng bộ số thông báo chưa đọc ra localStorage và phát event
  useEffect(() => {
    localStorage.setItem(ADMIN_UNREAD_COUNT_KEY, String(unreadCount));
    window.dispatchEvent(
      new CustomEvent(ADMIN_UNREAD_COUNT_EVENT, {
        detail: unreadCount,
      })
    );
  }, [unreadCount]);

  const handleAdd = async () => {
    if (!form.title || !form.content) return;

    try {
      const response = await notificationService.createNotification({
        title: form.title,
        content: form.content,
        type: form.type,
        status: "draft",
        priority: "normal",
      });

      if (response.success) {
        if (response.data?.id) {
          await notificationService.sendNotification(response.data.id);
        }
        await fetchNotifications();
        setOpen(false);
        setForm({ title: "", content: "", type: "Tất cả" });
      }
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể gửi thông báo."));
    }
  };

  const handleHide = async (item) => {
    const hiddenIds = new Set(readHiddenNotificationIds());
    hiddenIds.add(String(item.id));
    saveHiddenNotificationIds(hiddenIds);

    setList((prev) => prev.filter((i) => i.id !== item.id));
    if (detail?.id === item.id) {
      setDetail(null);
    }

    if (!item.read) {
      try {
        await notificationService.markNotificationRead(item.id);
      } catch (error) {
        console.warn("[ManagementNotifications] Failed to mark hidden notification read:", error);
      }
    }
  };

  const handleOpenDetail = async (item) => {
    setDetail(item);

    if (item.read) return;

    const previousList = list;
    setList((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, read: true, unread: false } : i
      )
    );

    try {
      await notificationService.markNotificationRead(item.id);
    } catch (error) {
      setList(previousList);
      setLoadError(getErrorMessage(error, "Không thể đánh dấu thông báo đã đọc."));
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    const previousList = list;
    setList((prev) =>
      prev.map((item) => ({ ...item, read: true, unread: false }))
    );

    try {
      await notificationService.markAllNotificationsRead();
    } catch (error) {
      setList(previousList);
      setLoadError(getErrorMessage(error, "Không thể đánh dấu tất cả đã đọc."));
    }
  };

  const filteredList = useMemo(() => {
    if (activeFilter === "Tất cả") return sortedList;
    return sortedList.filter((item) => {
      if (activeFilter === "Giáo viên") return item.type === "Giáo viên";
      if (activeFilter === "Phụ huynh") return item.type.includes("Phụ huynh");
      if (activeFilter.includes("Khối")) {
        const gradeNum = activeFilter.replace("Khối ", "");
        return item.type.includes(gradeNum);
      }
      return item.type === activeFilter;
    });
  }, [activeFilter, sortedList]);

  const handleHideVisible = async () => {
    if (filteredList.length === 0) return;

    const hiddenIds = new Set(readHiddenNotificationIds());
    filteredList.forEach((item) => hiddenIds.add(String(item.id)));
    saveHiddenNotificationIds(hiddenIds);

    const hiddenIdSet = new Set(filteredList.map((item) => item.id));
    setList((prev) => prev.filter((item) => !hiddenIdSet.has(item.id)));

    if (detail && hiddenIdSet.has(detail.id)) {
      setDetail(null);
    }

    await Promise.allSettled(
      filteredList
        .filter((item) => !item.read)
        .map((item) => notificationService.markNotificationRead(item.id))
    );
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <div className="admin-header-title">
          <h2>Trung tâm Thông báo</h2>
          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : loadError ? (
            <p style={{ color: "var(--red-primary)" }}>{loadError}</p>
          ) : (
            <p>{unreadCount} chưa đọc / {list.length} thông báo</p>
          )}
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-bell-btn"
            onClick={handleMarkAllRead}
            title="Đánh dấu tất cả đã đọc"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          <button
            className="admin-bell-btn"
            onClick={handleHideVisible}
            title="Ẩn thông báo đang hiển thị"
            disabled={filteredList.length === 0}
          >
            <EyeOff size={18} />
          </button>

          <button
            className="admin-btn-add"
            onClick={() => {
              setForm({
                title: "",
                content: "",
                type: "Tất cả",
              });
              setOpen(true);
            }}
          >
            <BellPlus size={16} />
            Gửi thông báo
          </button>
        </div>
      </div>

      <div className="admin-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${
              activeFilter === f ? "active" : ""
            }`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <NotificationHistorySection
        list={filteredList}
        onHide={handleHide}
        onClickItem={handleOpenDetail}
      />

      <CreateNotificationSection
        open={open}
        setOpen={setOpen}
        form={form}
        setForm={setForm}
        onSubmit={handleAdd}
        typeOptions={TARGET_OPTIONS}
      />

      {detail && (
        <div className="admin-modal" onClick={() => setDetail(null)}>
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="admin-close"
              onClick={() => setDetail(null)}
            >
              ×
            </button>

            <h3>{detail.title}</h3>
            <p>{detail.content}</p>
            <span>{detail.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementNotifications;
