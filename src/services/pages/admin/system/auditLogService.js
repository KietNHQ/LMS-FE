import axios from "../../../shared/http/axiosClient";

const auditLogService = {
  /**
   * Get permission audit logs
   */
  getPermissionLogs: async (params = {}) => {
    try {
      const response = await axios.get("/audit-logs/permissions", {
        params
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching permission logs:", error);
      throw error;
    }
  },

  /**
   * Get specific audit log details
   */
  getLogDetails: async (id) => {
    try {
      const response = await axios.get(`/audit-logs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching log details:", error);
      throw error;
    }
  }
};

export default auditLogService;
