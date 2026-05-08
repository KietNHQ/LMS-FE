import axiosClient from "../../../shared/http/axiosClient";

const CATEGORY_MAP = {
  announcement: "Hệ thống",
  alert: "Hệ thống",
  reminder: "Hệ thống",
  grade: "Môn học",
  attendance: "Môn học",
  exam: "Môn học",
  fee: "Hệ thống",
  general: "Hệ thống",
};

const isImportantPriority = (priority) => {
  if (priority === null || priority === undefined) return false;
  const normalized = String(priority).toLowerCase();
  return !["normal", "low", "0", "false", ""].includes(normalized);
};

const mapNotification = (item = {}) => ({
  id: item.id,
  title: item.title || "Thông báo",
  content: item.content || "",
  date: item.sent_at || item.sentAt || item.created_at || item.createdAt || item.date || new Date().toISOString(),
  unread: item.is_read === undefined ? Boolean(item.unread ?? true) : !item.is_read,
  important: item.important !== undefined ? Boolean(item.important) : isImportantPriority(item.priority),
  priority: item.priority ?? "normal",
  category: item.category || CATEGORY_MAP[item.type] || "Hệ thống",
  type: item.type || "general",
  raw: item,
});

const extractNotificationList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
};

const normalizeListResponse = (response) => {
  const notifications = extractNotificationList(response).map(mapNotification);
  const payload = response?.data ?? response;
  return {
    success: response?.success ?? payload?.success ?? true,
    data: notifications,
    unreadCount:
      response?.unreadCount ??
      payload?.unreadCount ??
      notifications.filter((item) => item.unread).length,
    pagination: response?.pagination ?? payload?.pagination ?? null,
    message: response?.message ?? payload?.message ?? "",
  };
};

const unwrapMutationResponse = (response) => {
  const payload = response?.data ?? response;
  return {
    success: response?.success ?? payload?.success ?? true,
    data: payload?.data ?? payload,
    message: response?.message ?? payload?.message ?? "",
  };
};

export const notificationService = {
  async listNotifications({ params, mock = false } = {}) {
    if (mock) {
      return normalizeListResponse({ data: [], success: true });
    }
    const response = await axiosClient.get("/notifications/my", {
      params: params || {},
    });
    return normalizeListResponse(response);
  },

  async getUnreadCount({ mock = false } = {}) {
    if (mock) {
      return { success: true, unreadCount: 0 };
    }
    const response = await axiosClient.get("/notifications/my/unread-count");
    const payload = response?.data ?? response;
    return {
      success: response?.success ?? payload?.success ?? true,
      unreadCount: payload?.unreadCount ?? payload?.data?.unreadCount ?? 0,
      message: response?.message ?? payload?.message ?? "",
      data: payload,
    };
  },

  async markAllNotificationsRead({ mock = false } = {}) {
    if (mock) return { success: true };
    const response = await axiosClient.put("/notifications/my/read-all");
    return unwrapMutationResponse(response);
  },

  async markNotificationRead(id, { mock = false } = {}) {
    if (mock) return { success: true };
    const response = await axiosClient.put(`/notifications/my/${id}/read`);
    return unwrapMutationResponse(response);
  },
};

