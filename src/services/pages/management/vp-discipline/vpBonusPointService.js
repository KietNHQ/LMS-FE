/**
 * Bonus Point Service
 * API service for bonus points (điểm cộng)
 */

import { createScopedApiService } from "../../admin/generated/createScopedApiService";

const BONUS_POINT_MODULES = [
  "bonus_points",
];

const scopedApi = createScopedApiService(BONUS_POINT_MODULES);

export const vpBonusPointService = {
  role: "bonus-points",

  /**
   * Get all bonus point rules
   */
  getBonusPointRules: () => scopedApi.callByKey("get_bonus_points_rules"),

  /**
   * Get bonus points for a specific student
   */
  getStudentBonusPoints: (enrollmentId, params = {}) =>
    scopedApi.callByKey("get_bonus_points_student_by_enrollmentid", {
      pathParams: { enrollmentId },
      params,
    }),

  /**
   * Calculate bonus points for a student
   */
  calculateStudentBonusPoints: (enrollmentId, params = {}) =>
    scopedApi.callByKey("get_bonus_points_student_by_enrollmentid_calculate", {
      pathParams: { enrollmentId },
      params,
    }),

  /**
   * Award a bonus point to a student
   */
  awardBonusPoint: (body) =>
    scopedApi.callByKey("post_bonus_points", { body }),

  /**
   * Bulk award bonus points
   */
  bulkAwardBonusPoints: (body) =>
    scopedApi.callByKey("post_bonus_points_bulk", { body }),

  /**
   * Get class bonus points summary
   */
  getClassBonusPointsSummary: (classId, params = {}) =>
    scopedApi.callByKey("get_bonus_points_class_by_classid", {
      pathParams: { classId },
      params,
    }),

  /**
   * Update a bonus point record
   */
  updateBonusPoint: (id, body) =>
    scopedApi.callByKey("put_bonus_points_by_id", {
      pathParams: { id },
      body,
    }),

  /**
   * Delete a bonus point record
   */
  deleteBonusPoint: (id) =>
    scopedApi.callByKey("delete_bonus_points_by_id", {
      pathParams: { id },
    }),

  /**
   * Seed default bonus point rules
   */
  seedRules: () =>
    scopedApi.callByKey("post_bonus_points_rules_seed"),
};

export default vpBonusPointService;
