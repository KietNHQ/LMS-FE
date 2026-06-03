import axiosClient from "../../../shared/http/axiosClient";

const getPayload = (response) => response?.data ?? response ?? {};

export const disciplinePeriodClosingService = {
  closeDisciplinePeriod: async (data) => {
    const response = await axiosClient.post("/discipline/period-closings", data);
    return getPayload(response);
  },

  getClosedPeriods: async (periodType) => {
    const params = periodType ? { periodType } : {};
    const response = await axiosClient.get("/discipline/period-closings", { params });
    const payload = getPayload(response);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  checkPeriodLocked: async (periodType, periodKey) => {
    const response = await axiosClient.get(
      `/discipline/period-closings/check/${periodType}/${periodKey}`
    );
    return getPayload(response);
  },

  reopenPeriod: async (id) => {
    const response = await axiosClient.delete(`/discipline/period-closings/${id}`);
    return getPayload(response);
  },
};

export default disciplinePeriodClosingService;
