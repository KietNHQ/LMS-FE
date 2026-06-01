import axiosClient from "../../../shared/http/axiosClient";

export const schoolEventsService = {
  list: async ({ semesterId, schoolYearId } = {}) => {
    const params = {};
    if (semesterId) params.semesterId = semesterId;
    if (schoolYearId) params.schoolYearId = schoolYearId;
    const resp = await axiosClient.get("/school-events", { params });
    return resp?.data || [];
  },

  COLOR_TO_EVENTTYPE: {
    blue: "exam",
    red: "ceremony",
    orange: "holiday",
    teal: "meeting",
  },

  create: async (data) => {
    const eventTypeRaw = data.eventType || data.color || "other";
    const eventType = schoolEventsService.COLOR_TO_EVENTTYPE[eventTypeRaw] || eventTypeRaw;
    const body = {
      title: data.title,
      description: data.content || data.description || "",
      date: data.date,
      endDate: data.endDate || data.date,
      eventType,
      color: data.color || "#3B82F6",
      semesterId: data.semesterId,
      schoolYearId: data.schoolYearId,
    };
    const resp = await axiosClient.post("/school-events", body);
    return resp?.data || resp;
  },

  delete: async (id) => {
    const resp = await axiosClient.delete(`/school-events/${id}`);
    return resp;
  },
};
