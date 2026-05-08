import axiosClient from "../../../shared/http/axiosClient";

const TIMETABLE_ENDPOINTS = {
    BASE: "/timetable",
    EXPORT: "/timetable/export"
};

/**
 * Resiliently extracts rows from various API response structures
 */
const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const timetableService = {
    /**
     * Fetch timetable data with optional filters
     * @param {Object} params { classId, semesterId, dayOfWeek, teacherId }
     */
    listTimetable: async (params = {}) => {
        const response = await axiosClient.get(TIMETABLE_ENDPOINTS.BASE, { params });
        return getRows(response);
    },

    /**
     * Trigger Excel export
     */
    exportExcel: async (params = {}) => {
        // This usually returns a blob
        const response = await axiosClient.get(TIMETABLE_ENDPOINTS.EXPORT, {
            params,
            responseType: 'blob'
        });
        return response;
    }
};

export default timetableService;



