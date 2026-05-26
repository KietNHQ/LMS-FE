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
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.lessons)) return payload.lessons;
    return [];
};

/** BE timetable uses day_of_week 2=Thứ 2 … 7=Thứ 7 (1=Chủ nhật) */
export const API_DAY_TO_LABEL = {
    1: "Chủ nhật",
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
};

const timetableService = {
    /**
     * Fetch timetable data with optional filters
     * @param {Object} params { classId, semesterId, dayOfWeek, teacherId }
     */
    listTimetable: async (params = {}) => {
        const apiParams = {};
        if (params.classId != null) apiParams.class_id = params.classId;
        if (params.teacherId != null) apiParams.teacher_id = params.teacherId;
        if (params.semesterId != null) apiParams.semester_id = params.semesterId;
        if (params.schoolYearId != null) apiParams.school_year_id = params.schoolYearId;
        if (params.dayOfWeek != null) apiParams.day_of_week = params.dayOfWeek;
        if (params.roomId != null) apiParams.room_id = params.roomId;

        const response = await axiosClient.get(TIMETABLE_ENDPOINTS.BASE, { params: apiParams });
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



