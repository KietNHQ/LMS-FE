import axios from "../../../shared/http/axiosClient";

const systemLogService = {
  /**
   * Get system logs
   */
  getSystemLogs: async (params = {}) => {
    try {
      const response = await axios.get("/system-logs", {
        params
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching system logs:", error);
      throw error;
    }
  },

  /**
   * Get today's activity stats
   */
  getStats: async () => {
    try {
      const response = await axios.get("/system-logs/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching system stats:", error);
      throw error;
    }
  }
};

export default systemLogService;
