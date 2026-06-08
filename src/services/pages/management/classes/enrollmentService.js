import axiosClient from "../../../shared/http/axiosClient";

export const enrollmentService = {
  /**
   * Get unassigned students pool (class_id IS NULL) for a school year.
   * @param {number} schoolYearId
   * @returns {Promise<Array>}
   */
  getUnassignedPool(schoolYearId) {
    if (!schoolYearId) return Promise.resolve([]);
    return axiosClient
      .get("/enrollments/unassigned-pool", {
        params: { schoolYearId },
      })
      .then((res) => res.data?.data ?? []);
  },

  /**
   * Bulk assign students to a class.
   * @param {number[]} enrollmentIds
   * @param {number} classId
   * @returns {Promise<Object>}
   */
  assignClass(enrollmentIds, classId) {
    return axiosClient.put("/enrollments/assign-class", {
      enrollmentIds,
      classId,
    });
  },
};
