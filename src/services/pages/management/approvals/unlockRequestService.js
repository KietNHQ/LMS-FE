import axiosClient from "../../../shared/http/axiosClient";

/**
 * Service for unlock request management.
 * BE base: /api/v1/unlock-requests
 */
export const unlockRequestService = {
  /**
   * List unlock requests with optional filters.
   * @param {object} params - { status, semesterId, schoolYearId, targetType, page, limit }
   */
  listRequests: async (params = {}) => {
    const response = await axiosClient.get("/unlock-requests", { params });
    return response?.data ?? response;
  },

  /**
   * Get a single unlock request by ID.
   * @param {number} id
   */
  getRequest: async (id) => {
    const response = await axiosClient.get(`/unlock-requests/${id}`);
    return response?.data ?? response;
  },

  /**
   * Approve an unlock request.
   * @param {number} id - request ID
   * @param {object} body - { hours?, notes? }
   */
  approveRequest: async (id, body = {}) => {
    const response = await axiosClient.post(`/unlock-requests/${id}/approve`, body);
    return response?.data ?? response;
  },

  /**
   * Reject an unlock request.
   * @param {number} id - request ID
   * @param {object} body - { notes } (required, min 5 chars)
   */
  rejectRequest: async (id, body = {}) => {
    const response = await axiosClient.post(`/unlock-requests/${id}/reject`, body);
    return response?.data ?? response;
  },
};

export default unlockRequestService;
