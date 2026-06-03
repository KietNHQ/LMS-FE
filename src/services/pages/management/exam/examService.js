import axiosClient from "../../../shared/http/axiosClient";

const EXAM_ENDPOINTS = {
    BASE: "/exams",
};

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

const examService = {
    /**
     * List all exams with optional filters
     * @param {Object} params { semesterId, schoolYearId }
     */
    listExams: async (params = {}) => {
        const apiParams = {};
        if (params.semesterId != null) apiParams.semester_id = params.semesterId;
        if (params.schoolYearId != null) apiParams.school_year_id = params.schoolYearId;

        const response = await axiosClient.get(EXAM_ENDPOINTS.BASE, { params: apiParams });
        return getRows(response);
    },

    /**
     * Get a single exam by ID
     * @param {number} examId
     */
    getExam: async (examId) => {
        const response = await axiosClient.get(`${EXAM_ENDPOINTS.BASE}/${examId}`);
        return response;
    },

    /**
     * Create a new exam
     * @param {Object} examData
     */
    createExam: async (examData = {}) => {
        const payload = {
            title: examData.title,
            semester_id: examData.semesterId,
            school_year_id: examData.schoolYearId,
            start_date: examData.startDate,
            end_date: examData.endDate,
            start_time: examData.startTime,
            duration: examData.duration,
            staff_arrival: examData.staffArrival,
            exam_type: examData.examType,
            target: examData.target,
            subject_ids: examData.subjectIds,
            description: examData.description,
        };
        const response = await axiosClient.post(EXAM_ENDPOINTS.BASE, payload);
        return response;
    },

    /**
     * Update an exam
     * @param {number} examId
     * @param {Object} examData
     */
    updateExam: async (examId, examData = {}) => {
        const payload = {
            title: examData.title,
            start_date: examData.startDate,
            end_date: examData.endDate,
            start_time: examData.startTime,
            duration: examData.duration,
            staff_arrival: examData.staffArrival,
            exam_type: examData.examType,
            target: examData.target,
            subject_ids: examData.subjectIds,
            description: examData.description,
        };
        const response = await axiosClient.put(`${EXAM_ENDPOINTS.BASE}/${examId}`, payload);
        return response;
    },

    /**
     * Delete an exam
     * @param {number} examId
     */
    deleteExam: async (examId) => {
        const response = await axiosClient.delete(`${EXAM_ENDPOINTS.BASE}/${examId}`);
        return response;
    },
};

export default examService;
