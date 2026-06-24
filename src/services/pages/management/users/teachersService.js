import axiosClient from "../../../shared/http/axiosClient";
import { importExportService } from "../../admin/import-export/importExportService";

const statusFromApi = new Map([
  ["active", "Hoạt động"],
  ["inactive", "Vô hiệu hóa"],
]);
const statusToApi = new Map([
  ["Hoạt động", "active"],
  ["Tạm khóa", "inactive"],
  ["Vô hiệu hóa", "inactive"],
]);

const getPayload = (response) => response?.data ?? response ?? {};

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
  const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  const vnMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vnMatch) {
    const [, day, month, year] = vnMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return text.slice(0, 10);
};

const normalizeGender = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (["m", "male", "nam"].includes(normalized)) return "M";
  if (["f", "female", "nữ", "nu"].includes(normalized)) return "F";
  if (["u", "unknown", "khác"].includes(normalized)) return "U";
  return undefined;
};

const isIntegerId = (value) => /^\d+$/.test(String(value || ""));

const compactUnique = (values = []) =>
  Array.from(new Set(values.filter((value) => value !== undefined && value !== null && value !== "")));

const hasText = (value) => String(value || "").trim().length > 0;

const buildUserUpdatePayload = (formData = {}) => {
  const phone = formData.phone === "—" || formData.phone === "--" ? "" : formData.phone;
  const { surname, givenName } = splitFullName(formData.name);

  return {
    email: formData.email || undefined,
    fullName: formData.name || undefined,
    givenName: formData.firstName || formData.givenName || formData.profile?.firstName || givenName || undefined,
    surname: formData.lastName || formData.surname || formData.profile?.lastName || surname || undefined,
    phone: phone || formData.profile?.phone || undefined,
    birthDate: normalizeDate(formData.dob || formData.profile?.dob) || undefined,
    status: statusToApi.get(formData.status) || formData.status || undefined,
  };
};

const buildTeacherUpdatePayload = (formData = {}) => {
  const profile = formData.profile || {};
  const phone = formData.phone === "—" || formData.phone === "--" ? "" : formData.phone;
  const { surname, givenName } = splitFullName(formData.name);
  const qualification =
    formData.qualification !== undefined
      ? formData.qualification
      : profile.qualification || "";
  const primarySubject =
    formData.primarySubject !== undefined
      ? formData.primarySubject
      : formData.subject !== undefined
        ? formData.subject
        : profile.subject || "";

  return {
    teacherCode: formData.teacherCode || profile.teacherCode || undefined,
    givenName: formData.firstName || formData.givenName || profile.firstName || givenName || undefined,
    surname: formData.lastName || formData.surname || profile.lastName || surname || undefined,
    gender: normalizeGender(formData.gender || profile.gender),
    birthDate: normalizeDate(formData.dob || profile.dob) || undefined,
    phone: phone || profile.phone || "",
    qualification,
    primarySubject,
    hireDate: normalizeDate(formData.hireDate || profile.hireDate) || undefined,
    syncTeachingSubjectAssignments: formData.syncTeachingSubjectAssignments || undefined,
  };
};

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

const parseTeacher = (item = {}) => {
  const profile = item.profile || {};
  const hasTeacherTableShape = item.user_id || item.teacher_code || item.given_name || item.surname;
  const teacherId = item.teacher_id || item.teacherId || (hasTeacherTableShape ? item.id : item.teacherTableId);
  const userId = item.user_id || item.userId || (!hasTeacherTableShape ? item.id : undefined);
  const qualification = item.qualification || profile.qualification || "";
  const primarySubject = item.primary_subject || item.primarySubject || profile.primarySubject || "";
  const subjects = item.subjects || primarySubject || item.subject || item.subject_name || profile.subject || "";
  let name = item.fullName || item.name || item.full_name || "";
  
  if (!name && profile) {
    name = profile.fullName || profile.name || "";
    if (!name && (profile.firstName || profile.lastName)) {
      name = `${profile.lastName || ""} ${profile.firstName || ""}`.trim();
    }
  }
  
  if (!name && (item.given_name || item.surname)) {
    name = `${item.surname || ""} ${item.given_name || ""}`.trim();
  }
  
  if (!name && (item.firstName || item.lastName)) {
    name = `${item.lastName || ""} ${item.firstName || ""}`.trim();
  }

  // Final fallback to email prefix if still empty
  if (!name && item.email) {
    name = item.email.split("@")[0];
  }

  return {
    id: userId || item.id,
    userId,
    teacherId,
    teacherIds: teacherId ? [teacherId] : [],
    teacherCode: item.teacher_code || item.teacherCode || profile.teacherCode || "",
    name,
    lastName: item.lastName || item.surname || profile.lastName || "",
    firstName: item.firstName || item.given_name || profile.firstName || "",
    gender: item.gender || profile.gender || "",
    dob: normalizeDate(item.dob || profile.dob || item.birth_date) || "",
    email: item.email || "",
    role: "Giáo viên",
    phone: item.phone || profile.phone || "—",
    qualification,
    primarySubject,
    subjects,
    subject: subjects || "",
    assignedSubjects: subjects,
    homeroomClass: item.homeroomClass || item.homeroom_class || item.homeroom_class_name || "",
    assignedClasses: item.assignedClasses || item.assigned_classes || [],
    hireDate: item.hire_date || item.hireDate || profile.hireDate || "",
    status: statusFromApi.get(item.status || item.user_status) || item.status || item.user_status || "Hoạt động",
    createdAt: item.createdAt ? `${item.createdAt}`.slice(0, 10) : "",
    profile: {
      ...profile,
      teacherCode: item.teacher_code || item.teacherCode || profile.teacherCode,
      firstName: item.given_name || profile.firstName,
      lastName: item.surname || profile.lastName,
      gender: item.gender || profile.gender,
      qualification,
      primarySubject,
      subject: subjects || "",
      hireDate: item.hire_date || item.hireDate || profile.hireDate,
      phone: item.phone || profile.phone,
      dob: normalizeDate(item.birth_date || profile.dob) || "",
    },
    progress: item.progress || {
      completionRate: 0,
      attendanceRate: 0,
      averageScore: 0,
      pendingLessonPlans: 0,
    },
  };
};

const mergeTeacherRows = (current, next) => {
  const qualification = current.qualification || next.qualification || "";
  const primarySubject = current.primarySubject || next.primarySubject || "";
  const subjects = current.subjects || next.subjects || current.subject || next.subject || primarySubject || "";
  const teacherCode =
    current.teacherCode && !String(current.teacherCode).startsWith("TCH-")
      ? current.teacherCode
      : next.teacherCode || current.teacherCode || "";

  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(next).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ),
    id: current.id || next.id,
    userId: current.userId || next.userId,
    teacherId: current.teacherId || next.teacherId,
    teacherIds: compactUnique([...(current.teacherIds || []), ...(next.teacherIds || []), current.teacherId, next.teacherId]),
    teacherCode,
    qualification,
    primarySubject,
    subjects,
    subject: subjects,
    phone: hasText(current.phone) && current.phone !== "—" ? current.phone : next.phone,
    status: current.status || next.status || "Hoạt động",
    profile: {
      ...(next.profile || {}),
      ...(current.profile || {}),
      teacherCode,
      qualification,
      primarySubject,
      subject: subjects,
    },
  };
};

const dedupeTeachers = (rows = []) => {
  const grouped = new Map();

  rows.forEach((teacher) => {
    const key = teacher.userId || teacher.id || `teacher:${teacher.teacherId}`;
    const existing = grouped.get(key);
    grouped.set(key, existing ? mergeTeacherRows(existing, teacher) : teacher);
  });

  return Array.from(grouped.values());
};

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getTeacherRowId = (item = {}) =>
  item.teacher_id || item.teacherId || item.teacherTableId || item.id;

const resolveTeacherIds = async ({ userId, email, teacherIds, includeMatchingRows = false }) => {
  const resolvedIds = compactUnique(teacherIds).filter(isIntegerId);
  if (!includeMatchingRows || (!userId && !email)) return resolvedIds;

  const response = await axiosClient.get("/teachers", {
    params: { page: 1, limit: 2000, _t: Date.now() },
  });
  const rows = getRows(getPayload(response));

  return compactUnique(
    [
      ...resolvedIds,
      ...rows
        .filter((row) => {
          const rowUserId = row.user_id || row.userId || row.user?.id || row.profile?.userId;
          const rowEmail = row.email || row.user?.email || row.profile?.email;
          return (userId && rowUserId === userId) || (email && rowEmail === email);
        })
        .map(getTeacherRowId),
    ]
  ).filter(isIntegerId);
};

export const teachersService = {
  listTeachers: async ({ limit = 2000 } = {}) => {
    const response = await requestWithFallback(["/teachers", "/users"], (basePath) => {
      const params = { page: 1, limit, _t: Date.now() };
      if (basePath === "/users") {
        return axiosClient.get(basePath, { params: { ...params, role: "teacher" } });
      }
      return axiosClient.get(basePath, { params });
    });

    const payload = getPayload(response);
    return dedupeTeachers(getRows(payload).map(parseTeacher));
  },

  createTeacher: async (formData) => {
    const { surname, givenName } = splitFullName(formData.name);
    const profile = formData.profile || {};
    const payload = {
      email: formData.email,
      fullName: formData.name,
      givenName: formData.firstName || profile.firstName || givenName,
      surname: formData.lastName || profile.lastName || surname,
      role: "teacher",
      phone: formData.phone === "—" ? "" : formData.phone,
      birthDate: formData.dob || null,
      qualification: formData.qualification || profile.qualification || null,
      primarySubject: formData.primarySubject || formData.subject || profile.primarySubject || profile.subject || null,
      teacherCode: profile.teacherCode || formData.teacherCode || null,
      hireDate: profile.hireDate || formData.hireDate || null,
    };

    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.post(basePath, payload));
  },

  updateTeacher: async (id, formData) => {
    const teacherId = formData.teacherId || (isIntegerId(id) ? id : null);
    const userId = formData.userId || (!isIntegerId(id) ? id : null) || (!isIntegerId(formData.id) ? formData.id : null);
    const teacherIds = await resolveTeacherIds({
      userId,
      email: formData.email,
      teacherIds: [...(formData.teacherIds || []), teacherId],
      includeMatchingRows: formData.requireTeacherProfileUpdate,
    });
    const requests = [];

    teacherIds.forEach((item) => {
      requests.push(axiosClient.put(`/teachers/${item}`, buildTeacherUpdatePayload(formData)));
    });

    if (formData.requireTeacherProfileUpdate && teacherIds.length === 0) {
      throw new Error("Không tìm thấy hồ sơ giáo viên để cập nhật môn dạy.");
    }

    if (userId) {
      requests.push(
        requestWithFallback(["/users", "/auth/users"], (basePath) =>
          axiosClient.put(`${basePath}/${userId}`, buildUserUpdatePayload(formData))
        )
      );
    }

    if (requests.length === 0) {
      throw new Error("Không tìm thấy ID giáo viên hoặc tài khoản để cập nhật.");
    }

    const results = await Promise.all(requests);
    return results[0];
  },

  deleteTeacher: async (id) => {
    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.delete(`${basePath}/${id}`));
  },

  importTeachers: async (file, options = {}) => {
    return requestWithFallback(["/imports/teachers", "/users/import", "/auth/users/import"], (path) => {
      if (path === "/imports/teachers") {
        return importExportService.importTeachers(file, options);
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
