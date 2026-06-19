import axiosClient from "../../../shared/http/axiosClient";

const NOTIFICATION_ENDPOINTS = {
    BASE: "/notifications",
    MY: "/notifications/my",
};

const TYPE_LABELS = {
    announcement: "Thông báo",
    alert: "Cảnh báo",
    reminder: "Nhắc nhở",
    grade: "Điểm số",
    fee: "Tài chính",
    attendance: "Điểm danh",
    exam: "Thi cử",
    general: "Chung",
};

const TARGET_LABELS = {
    all: "Tất cả",
    school: "Tất cả",
    class: "Lớp",
    student: "Học sinh",
    teacher: "Giáo viên",
};

const normalizeTargetInput = (type = "") => {
    const value = String(type).trim();

    if (value === "Giáo viên") {
        return { targetType: "teacher", targetId: null };
    }

    return { targetType: "school", targetId: null };
};

const normalizeCreatePayload = (data = {}) => {
    const { targetType, targetId } = normalizeTargetInput(data.type);

    return {
        title: data.title,
        content: data.content,
        type: data.notificationType || "announcement",
        targetType: data.targetType || targetType,
        targetId: data.targetId ?? targetId,
        status: data.status || "draft",
        priority: data.priority || "normal",
        sendEmail: data.sendEmail ?? false,
    };
};

/**
 * Resiliently extracts rows from various API response structures
 */
const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    return [];
};

const normalizeNotification = (item = {}) => {
    const targetType = item.target_type || item.targetType || "school";
    const isRead =
        item.is_read !== undefined
            ? Boolean(item.is_read)
            : item.read !== undefined
              ? Boolean(item.read)
              : item.status !== "unread";

    return {
        ...item,
        id: item.id,
        title: item.title || "",
        content: item.content || "",
        type: TARGET_LABELS[targetType] || TYPE_LABELS[item.type] || item.type || "Chung",
        notificationType: item.type || "general",
        targetType,
        date: item.sent_at || item.created_at || item.date || new Date().toISOString(),
        read: isRead,
        unread: !isRead,
        important: Boolean(item.is_important ?? item.important ?? false),
    };
};

const notificationService = {
    /**
     * List current user's notification inbox for read/unread state.
     */
    listNotifications: async (params = {}) => {
        const response = await axiosClient.get(NOTIFICATION_ENDPOINTS.MY, { params });
        return {
            items: getRows(response).map(normalizeNotification),
            unreadCount: response?.unreadCount ?? response?.data?.unread_count ?? 0,
            pagination: response?.pagination || {},
        };
    },

    /**
     * Create a new notification
     */
    createNotification: async (data) => {
        const payload = normalizeCreatePayload(data);
        const response = await axiosClient.post(NOTIFICATION_ENDPOINTS.BASE, payload);
        return response;
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (id) => {
        const response = await axiosClient.delete(`${NOTIFICATION_ENDPOINTS.BASE}/${id}`);
        return response;
    },

    /**
     * Send a notification
     */
    sendNotification: async (id) => {
        const response = await axiosClient.post(`${NOTIFICATION_ENDPOINTS.BASE}/${id}/send`);
        return response;
    },

    markNotificationRead: async (id) => {
        const response = await axiosClient.put(`${NOTIFICATION_ENDPOINTS.MY}/${id}/read`);
        return response;
    },

    markAllNotificationsRead: async () => {
        const response = await axiosClient.put(`${NOTIFICATION_ENDPOINTS.MY}/read-all`);
        return response;
    },

    toggleNotificationImportant: async (id) => {
        const response = await axiosClient.patch(`${NOTIFICATION_ENDPOINTS.MY}/${id}/toggle-important`);
        return response;
    },
};

export default notificationService;
