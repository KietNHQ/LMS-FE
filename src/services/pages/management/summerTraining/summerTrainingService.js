import axiosClient from "../../../shared/http/axiosClient";

/**
 * Lấy tổng kết rèn luyện hè của một lớp
 * @param {number} classId - ID lớp
 * @param {number} [page=1] - Trang hiện tại
 * @param {number} [limit=10] - Số items per page
 */
export const getSummerTrainingSummary = async (classId, page = 1, limit = 10) => {
  const response = await axiosClient.get(`/summer-training/class/${classId}/summary`, {
    params: { page, limit },
  });
  return response;
};

/**
 * Ghi danh học sinh có điều kiện vào rèn luyện hè
 * @param {number} schoolYearId - ID năm học
 */
export const enrollConditionalStudents = async (schoolYearId) => {
  const response = await axiosClient.post(`/summer-training/enroll-conditional`, {
    schoolYearId,
  });
  return response;
};

/**
 * Hoàn thành rèn luyện hè cho một học sinh
 * @param {number} enrollmentId - ID ghi danh
 * @param {boolean} upgradeConduct - Có nâng hạnh kiểm lên Tốt không
 * @param {number} daysAttended - Số ngày tham gia
 */
export const completeSummerTraining = async (enrollmentId, upgradeConduct = false, daysAttended = 0) => {
  const response = await axiosClient.post(`/summer-training/approve/${enrollmentId}`, {
    upgradeConduct,
    daysAttended,
  });
  return response;
};

/**
 * Ghi nhận điểm danh rèn luyện hè
 * @param {number} enrollmentId - ID ghi danh
 * @param {number} days - Số ngày tham gia
 */
export const recordAttendance = async (enrollmentId, days) => {
  const response = await axiosClient.post(`/summer-training/record-attendance/${enrollmentId}`, {
    days,
  });
  return response;
};

export const summerTrainingService = {
  getSummerTrainingSummary,
  enrollConditionalStudents,
  completeSummerTraining,
  recordAttendance,
};

export default summerTrainingService;
