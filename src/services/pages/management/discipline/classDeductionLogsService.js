import { createScopedApiService } from "../../admin/generated/createScopedApiService";

const MODULES = [
  "discipline",
  "violations",
  "rewards",
  "violation_types",
  "reward_types",
  "conduct_evaluations",
];

const scopedApi = createScopedApiService(MODULES);

export const classDeductionLogsService = {
  /**
   * Get violation logs for a specific class
   * @param {string|number} classId
   * @param {Object} filters
   * @param {string} [filters.startDate] - Start date (YYYY-MM-DD)
   * @param {string} [filters.endDate] - End date (YYYY-MM-DD)
   * @param {string|number} [filters.violationTypeId]
   * @param {string} [filters.status] - pending, approved, rejected
   * @param {string} [filters.studentName] - Search by student name
   * @param {number} [filters.page]
   * @param {number} [filters.limit]
   */
  getClassViolationLogs: (classId, filters = {}) => {
    return scopedApi.callByKey("get_discipline_violations_class_by_classid", {
      pathParams: { classId },
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        violationTypeId: filters.violationTypeId,
        status: filters.status,
        studentName: filters.studentName,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  },

  /**
   * Get reward logs for a specific class
   * @param {string|number} classId
   * @param {Object} filters
   * @param {string} [filters.startDate] - Start date (YYYY-MM-DD)
   * @param {string} [filters.endDate] - End date (YYYY-MM-DD)
   * @param {string|number} [filters.rewardTypeId]
   * @param {string} [filters.status] - pending, approved, rejected
   * @param {string} [filters.studentName] - Search by student name
   * @param {number} [filters.page]
   * @param {number} [filters.limit]
   */
  getClassRewardLogs: (classId, filters = {}) => {
    return scopedApi.callByKey("get_discipline_rewards_class_by_classid", {
      pathParams: { classId },
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        rewardTypeId: filters.rewardTypeId,
        status: filters.status,
        studentName: filters.studentName,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  },

  /**
   * Get discipline score summary for a class
   * @param {string|number} classId
   * @param {string} [startDate]
   * @param {string} [endDate]
   */
  getClassDisciplineSummary: (classId, startDate, endDate) => {
    return scopedApi.callByKey("get_discipline_class_by_classid_discipline_scores", {
      pathParams: { classId },
      params: { startDate, endDate },
    });
  },

  /**
   * Get discipline score details with breakdown
   * @param {string|number} classId
   * @param {Object} params
   */
  getClassDisciplineDetails: (classId, params = {}) => {
    return scopedApi.callByKey("get_discipline_class_by_classid_discipline_scores_details", {
      pathParams: { classId },
      params,
    });
  },

  /**
   * Get violation types list
   */
  getViolationTypes: (input = {}) => {
    return scopedApi.callByKey("get_violation_types", input);
  },

  /**
   * Get reward types list
   */
  getRewardTypes: (input = {}) => {
    return scopedApi.callByKey("get_reward_types", input);
  },
};

export default classDeductionLogsService;
