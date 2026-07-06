import axiosClient from "../../../shared/http/axiosClient";

const schoolEventsService = {
  async list({ semesterId, schoolYearId } = {}) {
    const params = {};
    if (semesterId) params.semesterId = semesterId;
    if (schoolYearId) params.schoolYearId = schoolYearId;
    const res = await axiosClient.get("/school-events", { params });
    return res.data ?? [];
  },

  async create(data) {
    const res = await axiosClient.post("/school-events", data);
    return res.data;
  },

  async update(id, data) {
    const res = await axiosClient.put(`/school-events/${id}`, data);
    return res.data;
  },

  async remove(id) {
    await axiosClient.delete(`/school-events/${id}`);
  },
};

export default schoolEventsService;
