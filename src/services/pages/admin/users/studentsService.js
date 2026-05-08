import axiosClient from "../../../shared/http/axiosClient";
import { importExportService } from "../import-export/importExportService";

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
    id: item.id,         // This is student table ID (integer) when from /students endpoint
    userId: item.user_id || item.userId || item.id, // user UUID for update
    name,
    email: item.email || "",
    gender: item.gender === "F" ? "Nữ" : item.gender === "M" ? "Nam" : profile.gender || "Nam",
    dob: item.dob || item.birth_date || profile.dob || "",
    className: item.className || item.current_class_name || profile.className || "10A1",
    academicYear: item.academicYear || profile.academicYear || "",
    teacher: item.teacher || profile.teacher || "Chưa phân công",
    parentName: item.parentName || item.parent_name || profile.parentName || "",
    parentPhone: item.parentPhone || item.parent_phone || profile.parentPhone || "",
    parentEmail: item.parentEmail || item.parent_email || profile.parentEmail || "",
    address: item.address || profile.address || "",
    status: statusFromApi.get(item.status) || item.user_status || profile.status || "Đang học",
    profile,
  };
};

export const studentsService = {
  listStudents: async () => {
    const response = await requestWithFallback(["/students", "/users"], (basePath) => {
      if (basePath === "/users") {
        return axiosClient.get(basePath, { params: { role: "student", page: 1, limit: 2000 } });
      }
      return axiosClient.get(basePath, { params: { page: 1, limit: 2000 } });
    });

    const payload = getPayload(response);
    return getRows(payload).map(parseStudent);
  },

  createStudent: async (formData) => {
    const payload = {
      email: formData.email,
      fullName: formData.name,
      role: "student",
      phone: formData.phone === "—" ? "" : formData.phone,
      dob: formData.dob || null,
      profile: formData.profile || {},
    };
    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.post(basePath, payload));
  },

  updateStudent: async (id, formData) => {
    const payload = {
      fullName: formData.name,
      email: formData.email,
      dob: formData.dob || null,
      status: statusToApi.get(formData.status) || undefined,
      profile: {
        ...(formData.profile || {}),
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        className: formData.className,
        address: formData.address,
        gender: formData.gender,
        status: formData.status,
      },
    };
    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.put(`${basePath}/${id}`, payload));
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


