import axiosClient from "../../../shared/http/axiosClient";
import { importExportService } from "../import-export/importExportService";

const statusFromApi = new Map([
  ["active", "Hoạt động"],
  ["inactive", "Tạm khóa"],
]);
const statusToApi = new Map([
  ["Hoạt động", "active"],
  ["Tạm khóa", "inactive"],
]);

const getPayload = (response) => response?.data ?? response ?? {};

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
  let name = item.fullName || item.name || item.full_name || "";
  
  if (!name && item.profile) {
    name = item.profile.fullName || item.profile.name || "";
    if (!name && (item.profile.firstName || item.profile.lastName)) {
      name = `${item.profile.lastName || ""} ${item.profile.firstName || ""}`.trim();
    }
  }
  
  if (!name && (item.firstName || item.lastName)) {
    name = `${item.lastName || ""} ${item.firstName || ""}`.trim();
  }

  // Final fallback to email prefix if still empty
  if (!name && item.email) {
    name = item.email.split("@")[0];
  }

  return {
    id: item.id,
    name,
    lastName: item.lastName || item.profile?.lastName || "",
    firstName: item.firstName || item.profile?.firstName || "",
    dob: item.dob || item.profile?.dob || item.birth_date || "",
    email: item.email || "",
    role: "Giáo viên",
    phone: item.phone || item.profile?.phone || "—",
    subject: item.subject || item.profile?.subject || item.subject_name || "",
    homeroomClass: item.homeroomClass || item.homeroom_class || "",
    assignedClasses: item.assignedClasses || item.assigned_classes || [],
    status: statusFromApi.get(item.status) || item.status || "Hoạt động",
    createdAt: item.createdAt ? `${item.createdAt}`.slice(0, 10) : "",
    profile: item.profile || {},
    progress: item.progress || {
      completionRate: 0,
      attendanceRate: 0,
      averageScore: 0,
      pendingLessonPlans: 0,
    },
  };
};

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const teachersService = {
  listTeachers: async () => {
    const response = await requestWithFallback(["/teachers", "/users"], (basePath) => {
      if (basePath === "/users") {
        return axiosClient.get(basePath, { params: { role: "teacher", page: 1, limit: 2000 } });
      }
      return axiosClient.get(basePath, { params: { page: 1, limit: 2000 } });
    });

    const payload = getPayload(response);
    return getRows(payload).map(parseTeacher);
  },

  createTeacher: async (formData) => {
    const payload = {
      email: formData.email,
      fullName: formData.name,
      role: "teacher",
      phone: formData.phone === "—" ? "" : formData.phone,
      dob: formData.dob || null,
      profile: formData.profile || {},
    };

    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.post(basePath, payload));
  },

  updateTeacher: async (id, formData) => {
    const payload = {
      fullName: formData.name,
      phone: formData.phone === "—" ? "" : formData.phone,
      dob: formData.dob || null,
      status: statusToApi.get(formData.status) || undefined,
      profile: {
        ...(formData.profile || {}),
        subject: formData.subject || formData.profile?.subject || "",
        phone: formData.phone === "—" ? "" : formData.phone,
      },
    };

    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.put(`${basePath}/${id}`, payload));
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


