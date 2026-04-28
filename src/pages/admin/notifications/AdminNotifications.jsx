import React, { useMemo, useState, useEffect } from "react";
import { Bell, BellPlus } from "lucide-react";
import "./AdminNotifications.css";
import notificationService from "../../../services/pages/admin/notifications/notificationService";
import NotificationHistorySection from "./components/notificationHistorySection/notificationHistorySection";
import CreateNotificationSection from "./components/createNotificationSection/createNotificationSection";

const FILTERS = ["Tất cả", "Khối 10", "Khối 11", "Khối 12", "Giáo viên", "Phụ huynh"];
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
  "Phụ huynh Lớp 12"
];

const getErrorMessage = (error, fallback) => {
  const apiError = error?.response?.data?.error;
  const apiMessage = error?.response?.data?.message;
  return apiMessage || apiError || fallback;
};

const AdminNotifications = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const [list, setList] = useState([]);
  
  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const result = await notificationService.listNotifications();
        // Map API data to UI structure
        const mapped = (result.items || []).map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type || "Chung",
          date: item.sent_at || item.created_at || new Date().toISOString(),
          read: true // Sent notifications are considered read by admin
        }));
        setList(mapped);
      } catch (error) {
        setLoadError(getErrorMessage(error, "Không thể tải danh sách thông báo."));
      } finally {
        setIsLoading(false);
      }
    };
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
    return () => window.removeEventListener("admin-notifications-updated", handleRefresh);
  }, []);

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "Tất cả",
  });

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [list]);

  const unreadCount = useMemo(() => list.filter((item) => !item.read).length, [list]);

  // Đồng bộ số thông báo chưa đọc ra localStorage và phát event
  useEffect(() => {
    localStorage.setItem("admin_unread_notifications_count", unreadCount);
    window.dispatchEvent(new Event("admin-notification-count-updated"));
  }, [unreadCount]);

  const handleAdd = async () => {
    if (!form.title || !form.content) return;

    try {
      const response = await notificationService.createNotification({
        title: form.title,
        content: form.content,
        type: form.type,
        status: 'sent', // Send immediately for now
        priority: 'normal'
      });

      if (response.success) {
        const newItem = {
          id: response.data?.id || Date.now(),
          ...form,
          date: new Date().toISOString(),
          read: true,
        };
        setList([newItem, ...list]);
        setOpen(false);
        setForm({ title: "", content: "", type: "Tất cả" });
      }
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể gửi thông báo."));
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa thông báo này?");
    if (!confirmed) return;

    try {
      await notificationService.deleteNotification(id);
      setList(list.filter((i) => i.id !== id));
      if (detail?.id === id) {
        setDetail(null);
      }
    } catch (error) {
      window.alert(getErrorMessage(error, "Không thể xóa thông báo."));
    }
  };

  const handleOpenDetail = (item) => {
    setDetail(item);

    setList((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, read: true } : i
      )
    );
  };

  const handleMarkAllRead = () => {
    setList((prev) => prev.map((item) => ({ ...item, read: true })));
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
            <p>{unreadCount} chưa đọc / {list.length} thông báo đã gửi</p>
          )}
        </div>

        <div className="admin-header-actions">
          <button className="admin-bell-btn" onClick={handleMarkAllRead} title="Đánh dấu tất cả đã đọc">
            <Bell size={18} />
            {unreadCount > 0 && <span>{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>

          <button className="admin-btn-add" onClick={() => {
  setForm({
    title: "",
    content: "",
    type: "Tất cả"
  });
  setOpen(true);
}}>
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
        onDelete={handleDelete}
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

export default AdminNotifications;
