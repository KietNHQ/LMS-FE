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
     * Create a new lesson
     * @param {Object} lessonData { classId, subjectCode, teacherId, roomId, dayOfWeek, periodNumber, periodEnd, semesterId, schoolYearId, note, mode }
     */
    createLesson: async (lessonData = {}) => {
        const payload = {};
        if (lessonData.classId != null) payload.classId = lessonData.classId;
        if (lessonData.subjectCode != null) payload.subjectCode = lessonData.subjectCode;
        if (lessonData.teacherId != null) payload.teacherId = lessonData.teacherId;
        if (lessonData.roomId != null) payload.roomId = lessonData.roomId;
        if (lessonData.dayOfWeek != null) payload.dayOfWeek = lessonData.dayOfWeek;
        if (lessonData.periodNumber != null) payload.periodNumber = lessonData.periodNumber;
        if (lessonData.periodEnd != null) payload.periodEnd = lessonData.periodEnd;
        if (lessonData.semesterId != null) payload.semesterId = lessonData.semesterId;
        if (lessonData.schoolYearId != null) payload.schoolYearId = lessonData.schoolYearId;
        if (lessonData.note != null) payload.note = lessonData.note;
        if (lessonData.mode != null) payload.mode = lessonData.mode;

        const response = await axiosClient.post(`${TIMETABLE_ENDPOINTS.BASE}/lessons`, payload);
        return response;
    },

    /**
     * Update an existing lesson
     * @param {number} lessonId - The lesson ID
     * @param {Object} lessonData - Fields to update
     */
    updateLesson: async (lessonId, lessonData = {}) => {
        const payload = {};
        if (lessonData.classId != null) payload.classId = lessonData.classId;
        if (lessonData.subjectCode != null) payload.subjectCode = lessonData.subjectCode;
        if (lessonData.teacherId != null) payload.teacherId = lessonData.teacherId;
        if (lessonData.roomId != null) payload.roomId = lessonData.roomId;
        if (lessonData.dayOfWeek != null) payload.dayOfWeek = lessonData.dayOfWeek;
        if (lessonData.periodNumber != null) payload.periodNumber = lessonData.periodNumber;
        if (lessonData.periodEnd != null) payload.periodEnd = lessonData.periodEnd;
        if (lessonData.note != null) payload.note = lessonData.note;
        if (lessonData.mode != null) payload.mode = lessonData.mode;

        const response = await axiosClient.put(`${TIMETABLE_ENDPOINTS.BASE}/lessons/${lessonId}`, payload);
        return response;
    },

    /**
     * Delete a lesson
     * @param {number} lessonId - The lesson ID to delete
     */
    deleteLesson: async (lessonId) => {
        const response = await axiosClient.delete(`${TIMETABLE_ENDPOINTS.BASE}/lessons/${lessonId}`);
        return response;
    },

    /**
     * Trigger Excel export
     */
    exportExcel: async (params = {}) => {
        const response = await axiosClient.get(TIMETABLE_ENDPOINTS.EXPORT, {
            params,
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Get teachers who teach a specific subject
     * @param {Object} params { subjectCode, classId?, semesterId?, schoolYearId? }
     */
    getTeachersBySubject: async (params = {}) => {
        const { subjectCode, classId, semesterId, schoolYearId } = params;
        const apiParams = {};
        if (classId != null) apiParams.classId = classId;
        if (semesterId != null) apiParams.semesterId = semesterId;
        if (schoolYearId != null) apiParams.schoolYearId = schoolYearId;

        const response = await axiosClient.get(
            `/class-teacher-subjects/subject/${encodeURIComponent(subjectCode)}/teachers`,
            { params: apiParams }
        );
        const rows = response?.data || [];
        return rows;
    },
};

export default timetableService;



