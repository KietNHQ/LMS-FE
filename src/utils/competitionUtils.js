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

  const [startRaw, endRaw] = `${schoolYear || ""}`.split("-");
  const startYear = parseInt(startRaw, 10);
  const endYear = parseInt(endRaw, 10);
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return {};
  }

  // HK1: August to January, HK2: January to June
  const termStart = term === "hk2" ? new Date(endYear, 0, 1) : new Date(startYear, 7, 1);
  termStart.setHours(0, 0, 0, 0);

  const startDate = new Date(termStart);
  startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
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

/**
 * Parse grade number from class name
 * @param {string} className - e.g. "10A1", "Lớp 10A1"
 * @returns {string} - grade like "10", "11", "12"
 */
export const parseGradeFromClass = (className = "") => {
  const matched = `${className}`.match(/\d+/);
  return matched ? matched[0] : "";
};
