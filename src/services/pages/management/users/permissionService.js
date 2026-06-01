import axiosClient from "../../../shared/http/axiosClient";

/**
 * Service for handling Permission-related API calls.
 * 
 * NOTE: axiosClient interceptor automatically unwraps response.data,
 * so we receive the API's top-level `data` object directly.
 * 
 * GET /permissions  -> { success, data: { permissions: [...], pagination } }
 *   axiosClient returns: { success, data: { permissions: [...] } }
 *   So: response.data.permissions is the array.
 *
 * GET /users/:id/permissions -> { success, data: { userId, role, permissions: [...], total } }
 *   axiosClient returns: { success, data: { permissions: [...] } }
 *   So: response.data.permissions is the array.
 *
 * PUT /users/:id/permissions -> requires { mode, permissionIds: [1, 2, 3] }  (camelCase, integers)
 */
export const permissionService = {
  /**
   * Get all available permissions in the system.
   * @returns {Promise<Array>} List of permission objects: [{ id, resource, action, description }]
   */
  getAllPermissions: async ({ limit = 1000 } = {}) => {
    try {
      const response = await axiosClient.get("/permissions?limit=200");
      // axiosClient unwraps response.data -> { success, data: { permissions, pagination } }
      const inner = response?.data ?? response ?? {};
      return Array.isArray(inner) ? inner : (inner.permissions || inner.items || []);
    } catch (error) {
      console.error("Error fetching all permissions:", error);
      throw error;
    }
  },

  /**
   * Get permissions assigned to a specific user.
   * @param {string} userId 
   * @returns {Promise<Array>} List of permission objects: [{ id, resource, action, granted, source }]
   */
  getUserPermissions: async (userId) => {
    try {
      const response = await axiosClient.get(`/users/${userId}/permissions`);
      // axiosClient unwraps response.data -> { success, data: { userId, role, permissions, total } }
      const inner = response?.data ?? response ?? {};
      return Array.isArray(inner) ? inner : (inner.permissions || inner.items || []);
    } catch (error) {
      console.error(`Error fetching permissions for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Update permissions for a specific user.
   * @param {string} userId 
   * @param {Object} payload 
   * @param {string} payload.mode - "replace" or "append"
   * @param {Array<number>} payload.permissionIds - Array of permission IDs (integers)
   * @returns {Promise<any>}
   */
  updateUserPermissions: async (userId, { mode = "replace", permissionIds = [] }) => {
    try {
      const response = await axiosClient.put(`/users/${userId}/permissions`, {
        mode,
        permissionIds,  // Backend requires camelCase permissionIds (array of ints)
      });
      return response?.data ?? response;
    } catch (error) {
      console.error(`Error updating permissions for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Assign a single permission to a user.
   * @param {string} userId 
   * @param {Object} permissionData { permissionId, granted }
   */
  assignPermission: async (userId, permissionData) => {
    try {
      const response = await axiosClient.post(`/users/${userId}/permissions`, permissionData);
      return response?.data ?? response;
    } catch (error) {
      console.error(`Error assigning permission to user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Revoke a single permission from a user.
   * @param {string} userId 
   * @param {number} permissionId 
   */
  revokePermission: async (userId, permissionId) => {
    try {
      const response = await axiosClient.delete(`/users/${userId}/permissions/${permissionId}`);
      return response?.data ?? response;
    } catch (error) {
      console.error(`Error revoking permission ${permissionId} from user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get all system roles.
   */
  getRoles: async () => {
    try {
      const response = await axiosClient.get("/roles");
      return response?.data ?? response ?? [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  /**
   * Get permission audit logs.
   */
  getPermissionAudit: async () => {
    try {
      const response = await axiosClient.get("/audit/permissions");
      return response?.data ?? response ?? [];
    } catch (error) {
      console.error("Error fetching permission audit logs:", error);
      throw error;
    }
  }
};

