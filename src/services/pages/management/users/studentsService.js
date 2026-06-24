import axiosClient from "../../../shared/http/axiosClient";
import { importExportService } from "../../admin/import-export/importExportService";
import { resolveSchoolYearId } from "../../../shared/schoolYearLookup";

const getPayload = (response) => response?.data ?? response ?? {};

const statusFromApi = new Map([
  ["active", "Đang học"],
  ["inactive", "Đình chỉ"],
  ["suspended", "Đình chỉ"],
  ["reserved", "Bảo lưu"],
  ["graduated", "Đã tốt nghiệp"],
]);

const statusToApi = new Map([
  ["Đang học", "active"],
  ["Đình chỉ", "suspended"],
  ["Bảo lưu", "reserved"],
  ["Đã tốt nghiệp", "graduated"],
]);

const splitFullName = (name = "") => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { surname: parts[0] || "", givenName: "" };
  }
  return {
    surname: parts.slice(0, -1).join(" "),
    givenName: parts[parts.length - 1],
  };
};

const normalizeDate = (value) => {
  if (!value || value === "—" || value === "--") return null;
  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[3]}-${slashMatch[2].padStart(2, "0")}-${slashMatch[1].padStart(2, "0")}`;
  }

  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);

  return null;
};

const normalizeGender = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (["nam", "m", "male"].includes(normalized)) return "M";
  if (["nữ", "nu", "f", "female"].includes(normalized)) return "F";
  return undefined;
};

const isIntegerId = (value) => /^\d+$/.test(String(value || ""));

const requestWithFallback = async (endpoints, callback) => {
  let lastError;
  for (const endpoint of endpoints) {
    try {
      return await callback(endpoint);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }
  throw lastError;
};

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.students)) return payload.students; // /students endpoint
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const parseStudent = (item = {}) => {
  const profile = item.profile || {};
  let name = item.fullName || item.full_name || item.name || `${item.given_name || ""} ${item.surname || ""}`.trim();
  const hasStudentTableShape = item.user_id || item.student_code || item.given_name || item.surname;
  const studentTableId = item.student_id || item.studentId || (hasStudentTableShape ? item.id : item.studentTableId);
  const userId = item.user_id || item.userId || (!hasStudentTableShape ? item.id : undefined);

  if (!name && profile) {
    name = profile.fullName || profile.name || "";
    if (!name && (profile.firstName || profile.lastName)) {
      name = `${profile.lastName || ""} ${profile.firstName || ""}`.trim();
    }
  }

  if (!name && item.email) {
    name = item.email.split("@")[0];
  }
    return {
    id: userId || item.id,
    userId,
    studentTableId,
    studentCode: item.student_code || item.studentCode || profile.studentCode || "",
    enrollmentId: item.enrollment_id || null, // student_enrollments.id (integer) — required for gradeService calls
    name,
    firstName: item.given_name || profile.firstName || "",
    lastName: item.surname || profile.lastName || "",
    email: item.email || "",
    gender: item.gender === "F" ? "Nữ" : item.gender === "M" ? "Nam" : profile.gender || "Nam",
    dob: normalizeDate(item.dob || item.birth_date || profile.dob) || "",
    className: item.className || item.current_class_name || profile.className || "",
    academicYear: item.academicYear || item.school_year_name || profile.academicYear || "",
    schoolYearId: item.school_year_id || item.schoolYearId || null,
    teacher: item.teacher || item.homeroomTeacher || item.homeroom_teacher_name || profile.teacher || profile.homeroomTeacher || "",
    parentName: item.parentName || item.parent_name || profile.parentName || "",
    parentPhone: item.parentPhone || item.parent_phone || profile.parentPhone || "",
    parentEmail: item.parentEmail || item.parent_email || profile.parentEmail || "",
    address: item.address || profile.address || "",
    status: statusFromApi.get(item.status || item.user_status) || item.status || item.user_status || profile.status || "Đang học",
    profile,
  };
};

export const studentsService = {
  listStudents: async ({ schoolYearId, schoolYearName } = {}) => {
    let resolvedSchoolYearId = schoolYearId;
    if (!resolvedSchoolYearId && schoolYearName) {
      resolvedSchoolYearId = await resolveSchoolYearId(schoolYearName);
    }

    const response = await requestWithFallback(["/students", "/users"], (basePath) => {
      const params = {
        page: 1,
        limit: 2000,
        ...(resolvedSchoolYearId ? { schoolYearId: resolvedSchoolYearId } : {}),
        _t: Date.now(),
      };
      if (basePath === "/users") {
        return axiosClient.get(basePath, { params: { ...params, role: "student" } });
      }
      return axiosClient.get(basePath, { params });
    });

    const payload = getPayload(response);
    return getRows(payload).map(parseStudent);
  },

  // Lấy danh sách học sinh theo lớp
  getClassStudents: async (classId, { schoolYearId } = {}) => {
    const params = {};
    if (schoolYearId) params.schoolYearId = schoolYearId;
    const response = await axiosClient.get(`/classes/${classId}/students`, { params });
    const payload = getPayload(response);
    const rows = Array.isArray(payload) ? payload : (payload.data || payload.students || []);
    return rows.map(parseStudent);
  },

  createStudent: async (formData) => {
    const { surname, givenName } = splitFullName(formData.name);
    const profile = formData.profile || {};
    const payload = {
      email: formData.email,
      fullName: formData.name,
      givenName: formData.firstName || profile.firstName || givenName,
      surname: formData.lastName || profile.lastName || surname,
      role: "student",
      phone: formData.phone === "—" ? "" : formData.phone,
      birthDate: formData.dob || null,
      studentCode: formData.studentCode || profile.studentCode || null,
      gender: normalizeGender(formData.gender || profile.gender) || null,
    };
    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.post(basePath, payload));
  },

  updateStudent: async (id, formData) => {
    const { surname, givenName } = splitFullName(formData.name);
    const profile = formData.profile || {};
    const studentId = formData.studentTableId || (isIntegerId(id) ? id : null);
    const userId = formData.userId || (!isIntegerId(id) ? id : null);
    const studentPayload = {
      studentCode: formData.studentCode || profile.studentCode || undefined,
      givenName: formData.firstName || formData.givenName || profile.firstName || givenName || undefined,
      surname: formData.lastName || formData.surname || profile.lastName || surname || undefined,
      gender: normalizeGender(formData.gender || profile.gender),
      birthDate: normalizeDate(formData.dob || profile.dob) || undefined,
      phone: formData.phone === "—" || formData.phone === "--" ? "" : formData.phone || profile.phone || undefined,
    };
    const userPayload = {
      fullName: formData.name,
      email: formData.email,
      givenName: studentPayload.givenName,
      surname: studentPayload.surname,
      birthDate: normalizeDate(formData.dob || profile.dob) || undefined,
      status: statusToApi.get(formData.status) || undefined,
    };
    const requests = [];

    if (studentId) {
      requests.push(axiosClient.put(`/students/${studentId}`, studentPayload));
    }

    if (userId) {
      requests.push(
        requestWithFallback(["/users", "/auth/users"], (basePath) =>
          axiosClient.put(`${basePath}/${userId}`, userPayload)
        )
      );
    }

    if (requests.length === 0) {
      throw new Error("Không tìm thấy ID học sinh hoặc tài khoản để cập nhật.");
    }

    const results = await Promise.all(requests);
    return results[0];
  },

  deleteStudent: async (id) => {
    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.delete(`${basePath}/${id}`));
  },

  importStudents: async (file, options = {}) => {
    return requestWithFallback(["/imports/students", "/users/import", "/auth/users/import"], (path) => {
      if (path === "/imports/students") {
        return importExportService.importStudents(file, options);
      }

      const formData = new FormData();
      formData.append("file", file);
      if (options && typeof options === "object" && Object.keys(options).length > 0) {
        formData.append("options", JSON.stringify(options));
      }

      return axiosClient.post(path, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    });
  },

  downloadTemplate: async () => {
    return requestWithFallback(["/users/import/template", "/auth/users/import/template"], (path) =>
      axiosClient.get(path, { responseType: "blob" })
    );
  },
};
