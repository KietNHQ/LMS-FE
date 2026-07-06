import axiosClient from "../../../shared/http/axiosClient";

/**
 * Lấy thông tin xếp lớp của một học sinh
 * @param {number} enrollmentId - ID ghi danh của học sinh
 * @param {number} hk1SemesterId - ID học kỳ 1
 * @param {number} hk2SemesterId - ID học kỳ 2
 */
export const getStudentPromotionStatus = async (enrollmentId, hk1SemesterId, hk2SemesterId) => {
  return axiosClient.get(`/promotion/student/${enrollmentId}`, {
    params: { hk1SemesterId, hk2SemesterId },
  });
};

/**
 * Lấy tổng kết xếp lớp của một lớp
 * @param {number} classId - ID lớp
 * @param {number} hk1SemesterId - ID học kỳ 1
 * @param {number} hk2SemesterId - ID học kỳ 2
 * @param {number} [page=1] - Trang hiện tại
 * @param {number} [limit=10] - Số items per page
 */
export const getClassPromotionSummary = async (classId, hk1SemesterId, hk2SemesterId, page = 1, limit = 10) => {
  const response = await axiosClient.get(`/promotion/class/${classId}/summary`, {
    params: { hk1SemesterId, hk2SemesterId, page, limit },
  });
  return response.data || null;
};

/**
 * Lên lớp hàng loạt cho cả lớp
 * @param {number} classId - ID lớp
 * @param {number} schoolYearId - ID năm học tiếp theo
 * @param {number} hk1SemesterId - ID học kỳ 1
 * @param {number} hk2SemesterId - ID học kỳ 2
 */
export const bulkPromote = async (
  classId,
  schoolYearId,
  hk1SemesterId,
  hk2SemesterId,
  enrollmentIds = [],
) => {
  const response = await axiosClient.post(`/promotion/class/${classId}/bulk-promote`, {
    schoolYearId,
    hk1SemesterId,
    hk2SemesterId,
    enrollmentIds,
  });
  return response;
};

/**
 * Lên lớp cho một học sinh
 * @param {number} enrollmentId - ID ghi danh
 */
export const singlePromote = async (enrollmentId) => {
  const response = await axiosClient.post(`/promotion/student/${enrollmentId}/single-promote`);
  return response;
};

/**
 * Xét lên lớp THỦ CÔNG cho một học sinh — bypass summer training và conditional status.
 * @param {number} enrollmentId - ID ghi danh
 * @param {string} reason       - Lý do override (bắt buộc)
 */
export const manualPromote = async (enrollmentId, reason) => {
  const response = await axiosClient.post(
    `/promotion/student/${enrollmentId}/manual-promote`,
    { reason },
  );
  return response;
};

/**
 * Lấy trạng thái khóa điểm của lớp cho trang xét lên lớp
 * @param {number} classId - ID lớp
 * @param {number} hk1SemesterId - ID học kỳ 1
 * @param {number} hk2SemesterId - ID học kỳ 2
 */
export const getLockStatus = async (classId, hk1SemesterId, hk2SemesterId) => {
  const response = await axiosClient.get(`/grades/class/${classId}/lock-status`, {
    params: { hk1SemesterId, hk2SemesterId },
  });
  return response;
};

/**
 * Kiểm tra công nợ học sinh trước khi lên lớp
 * @param {number} classId - ID lớp
 * @param {number} schoolYearId - ID năm học
 */
export const getFinanceCheck = async (classId, schoolYearId) => {
  const response = await axiosClient.get(`/promotion/class/${classId}/finance-check`, {
    params: { schoolYearId },
  });
  return response;
};

/**
 * Xét tốt nghiệp cho lớp 12
 * @param {number} classId - ID lớp
 * @param {number} schoolYearId - ID năm học
 * @param {number} hk1SemesterId - ID học kỳ 1
 * @param {number} hk2SemesterId - ID học kỳ 2
 */
export const graduateClass = async (classId, schoolYearId, hk1SemesterId, hk2SemesterId) => {
  const response = await axiosClient.post(`/promotion/class/${classId}/graduate`, {
    schoolYearId,
    hk1SemesterId,
    hk2SemesterId,
  });
  return response;
};

/**
 * Hủy lên lớp - revert students back to studying
 * @param {number} classId - ID lớp
 * @param {number} schoolYearId - ID năm học
 * @param {string} reason - Lý do hủy
 */
export const rollbackClass = async (classId, schoolYearId, reason) => {
  const response = await axiosClient.post(`/promotion/class/${classId}/rollback`, {
    schoolYearId,
    reason,
  });
  return response;
};

export const promotionService = {
  getStudentPromotionStatus,
  getClassPromotionSummary,
  bulkPromote,
  singlePromote,
  manualPromote,
  getLockStatus,
  getFinanceCheck,
  graduateClass,
  rollbackClass,
};

export default promotionService;
