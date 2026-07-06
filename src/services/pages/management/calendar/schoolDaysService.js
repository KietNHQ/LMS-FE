import axiosClient from "../../../../shared/http/axiosClient";

const schoolDaysService = {
  async list({ semesterId, schoolYearId } = {}) {
    const params = {};
    if (semesterId) params.semesterId = semesterId;
    if (schoolYearId) params.schoolYearId = schoolYearId;
    const res = await axiosClient.get("/school-days", { params });
    return res.data ?? [];
  },

  async generate(semesterId) {
    const res = await axiosClient.post("/school-days/generate", { semesterId });
    return res.data;
  },
};

export default schoolDaysService;
