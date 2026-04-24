import axiosClient from "../../../shared/http/axiosClient";

const NOTIFICATION_ENDPOINTS = {
    BASE: "/notifications",
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

const notificationService = {
    /**
     * List all notifications (Admin/Teacher view)
     */
    listNotifications: async (params = {}) => {
        const response = await axiosClient.get(NOTIFICATION_ENDPOINTS.BASE, { params });
        return {
            items: getRows(response),
            pagination: response?.pagination || {}
        };
    },

    /**
     * Create a new notification
     */
    createNotification: async (data) => {
        const response = await axiosClient.post(NOTIFICATION_ENDPOINTS.BASE, data);
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
    }
};

export default notificationService;
