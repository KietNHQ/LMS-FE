/**
 * Competition Utilities — FE mirror of BE competition.util.js
 * Helper functions for discipline ranking calculations
 */

/**
 * Convert week number to date range
 * @param {string} schoolYear - Format: "2025-2026"
 * @param {string} term - "hk1" or "hk2"
 * @param {number} week - Week number (1-36)
 * @returns {Object} {startDate, endDate} in YYYY-MM-DD format
 */
export const getWeekDateRange = (schoolYear, term, week) => {
  const weekNum = parseInt(week, 10);
  if (!Number.isFinite(weekNum) || weekNum <= 0) {
    return {};
  }

  const [startRaw] = `${schoolYear || ""}`.split("-");
  const startYear = parseInt(startRaw, 10);
  if (!Number.isFinite(startYear)) {
    return {};
  }

  // Mốc bắt đầu: Thứ 2, 25/08 của năm học
  const startDate = new Date(startYear, 7, 25);
  let totalDays = (weekNum - 1) * 7;
  
  // Cộng thêm các tuần nghỉ/thi (Gaps) để 35 tuần thực học trải dài đến hết tháng 5
  if (weekNum > 8) totalDays += 7;  // Thi Giữa HK1
  if (weekNum > 17) totalDays += 14; // Thi Cuối HK1 + Nghỉ giữa học kỳ
  if (weekNum > 22) totalDays += 14; // Nghỉ Tết Nguyên Đán (thường 2 tuần)
  if (weekNum > 30) totalDays += 7;  // Thi Giữa HK2

  startDate.setDate(startDate.getDate() + totalDays);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

const parseLocalDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "string") {
    const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matched) {
      const [, year, month, day] = matched;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";

  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getSchoolYearForDate = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const getTermForDate = (schoolYear, value) => {
  const date = parseLocalDate(value);
  if (!date) return "";

  const [startRaw, endRaw] = `${schoolYear || ""}`.split("-");
  const startYear = Number(startRaw);
  const endYear = Number(endRaw);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (Number.isFinite(startYear) && year === startYear && month >= 8) {
    return "hk1";
  }
  if (Number.isFinite(endYear) && year === endYear && month <= 7) {
    return "hk2";
  }
  return "";
};

export const getWeekForDate = (
  schoolYear,
  term,
  value,
  totalWeeks = 35,
) => {
  const targetDate = parseLocalDate(value);
  if (!targetDate) return null;

  for (let week = 1; week <= totalWeeks; week += 1) {
    const range = getWeekDateRange(schoolYear, term, week);
    const weekStart = parseLocalDate(range.startDate);
    const weekEnd = parseLocalDate(range.endDate);

    if (!weekStart || !weekEnd) continue;
    if (targetDate >= weekStart && targetDate <= weekEnd) {
      return { week, ...range };
    }
  }

  return null;
};

/**
 * Parse grade number from class name
 * @param {string} className - e.g. "10A1", "Lớp 10A1"
 * @returns {string} - grade like "10", "11", "12"
 */
export const parseGradeFromClass = (className = "") => {
  const matched = `${className}`.match(/\d+/);
  return matched ? matched[0] : "";
};
