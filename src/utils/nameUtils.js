/**
 * Utility functions for name formatting and normalization.
 */

/**
 * Formats a user's name based on available fields.
 * Prioritizes Full Name, then constructs it from parts if necessary.
 * 
 * @param {Object} item - The user/teacher object from API
 * @param {Object} options - Formatting options
 * @returns {string} - The formatted name
 */
export const formatName = (item = {}, options = {}) => {
  if (!item) return options.fallback || "Chưa cập nhật";

  // 1. Try common Full Name field names
  const fullName = item.fullName || 
                   item.full_name || 
                   item.name || 
                   item.teacher_full_name || 
                   item.student_full_name ||
                   item.homeroom_teacher_full_name ||
                   item.homeroom_full_name;
  
  if (fullName && fullName.trim()) return fullName.trim();

  // 2. Try constructing from parts (Surname + Middle + Given)
  const surname = item.surname || item.lastName || item.last_name || item.teacher_surname || item.homeroom_teacher_surname || item.homeroom_surname || "";
  const middleName = item.middleName || item.middle_name || "";
  const givenName = item.givenName || item.given_name || item.firstName || item.first_name || item.teacher_given_name || item.homeroom_teacher_given_name || item.homeroom_given_name || "";

  if (surname || middleName || givenName) {
    return `${surname} ${middleName} ${givenName}`.replace(/\s+/g, ' ').trim();
  }

  // 3. Fallback to generic name field if it exists
  if (item.teacher_name && item.teacher_name.trim()) return item.teacher_name.trim();
  if (item.homeroom_teacher_name && item.homeroom_teacher_name.trim()) return item.homeroom_teacher_name.trim();

  // 4. Final fallbacks
  return options.fallback || "Chưa cập nhật";
};

/**
 * Standardizes a teacher name specifically for class displays.
 */
export const formatTeacherName = (item = {}) => {
  return formatName(item, { fallback: "Chưa phân công" });
};
