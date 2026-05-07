import axiosClient from "../../../shared/http/axiosClient";

const USER_BASE_ENDPOINTS = ["/users", "/auth/users"];

const roleToApi = {
  "Quản trị viên": "admin",
  "Quản lý": "manager",
  "Giáo viên": "teacher",
  "Học sinh": "student",
  "Phụ huynh": "guardian",
};

const roleFromApi = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  teacher: "Giáo viên",
  student: "Học sinh",
  parent: "Phụ huynh",
  guardian: "Phụ huynh",
};

const statusToApi = {
  "Hoạt động": "active",
  "Vô hiệu hóa": "inactive",
};

const statusFromApi = {
  active: "Hoạt động",
  inactive: "Vô hiệu hóa",
};

const getPayload = (response) => {
  // If response has data and pagination, it's a wrapped object, return it as is
  if (response?.data && response?.pagination) {
    return response;
  }
  return response?.data ?? response ?? {};
};

const getInitial = (name = "") => {
  const trimmed = `${name}`.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
};

const getColorByRole = (roleLabel) => {
  if (roleLabel === "Quản trị viên") return "navy";
  if (roleLabel === "Quản lý") return "navy";
  if (roleLabel === "Giáo viên") return "teal";
  if (roleLabel === "Học sinh") return "blue";
  return "orange";
};

const requestWithEndpointFallback = async (builder) => {
  let lastError;

  for (const basePath of USER_BASE_ENDPOINTS) {
    try {
      return await builder(basePath);
    } catch (error) {
      const status = error?.response?.status;
      lastError = error;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
};

const mapApiUserToView = (user = {}) => {
  const roleLabel = roleFromApi[user.role] || user.role || "Học sinh";
  let fullName = user.fullName || user.name || user.full_name || "";

  if (!fullName && user.profile) {
    fullName = user.profile.fullName || user.profile.name || "";
    if (!fullName && (user.profile.firstName || user.profile.lastName)) {
      fullName = `${user.profile.lastName || ""} ${user.profile.firstName || ""}`.trim();
    }
  }

  if (!fullName && user.email) {
    fullName = user.email.split("@")[0];
  }

  return {
    id: user.id,
    name: fullName,
    email: user.email || "",
    role: roleLabel,
    phone: user.phone || "—",
    status: statusFromApi[user.status] || user.status || "Hoạt động",
    createdAt: user.createdAt ? `${user.createdAt}`.slice(0, 10) : "",
    dob: user.dob || user.birthDate || user.birth_date || "",
    avatar: getInitial(fullName),
    color: getColorByRole(roleLabel),
    profile: user.profile || {},
  };
};

const buildCreatePayload = (formData = {}) => {
  const role = roleToApi[formData.role] || "student";
  const profile = formData.profile || {};
  const phone = formData.phone === "—" ? "" : formData.phone;

  // Base payload — BE expects birthDate (not dob), and givenName/surname as top-level fields
  const payload = {
    email: formData.email,
    fullName: formData.name || `${formData.lastName || ""} ${formData.firstName || ""}`.trim(),
    givenName: formData.firstName || profile.firstName || "",
    surname: formData.lastName || profile.lastName || "",
    role,
    phone: phone || profile.phone || "",
    birthDate: formData.dob || profile.dob || null,
  };

  // Role-specific fields — BE expects these as top-level, not nested in "profile"
  if (role === "teacher") {
    payload.qualification = profile.subject || null;
    payload.teacherCode = profile.teacherCode || null;
    payload.hireDate = profile.hireDate || null;
  } else if (role === "student") {
    payload.studentCode = profile.studentCode || null;
    payload.gender = profile.gender || null;
  } else if (role === "guardian") {
    payload.occupation = profile.occupation || null;
    payload.studentIds = profile.studentIds || [];
  } else if (role === "manager" || role === "admin") {
    payload.title = profile.title || null;
    payload.permission_ids = profile.permission_ids || profile.permissions || [];
  }

  return payload;
};

const buildUpdatePayload = (formData = {}) => ({
  email: formData.email,
  fullName: formData.name || `${formData.lastName || ""} ${formData.firstName || ""}`.trim() || undefined,
  givenName: formData.firstName || formData.profile?.firstName || undefined,
  surname: formData.lastName || formData.profile?.lastName || undefined,
  phone: formData.phone === "—" ? "" : formData.phone,
  birthDate: formData.dob || formData.profile?.dob || undefined,
  status: statusToApi[formData.status] || undefined,
  gender: formData.profile?.gender || undefined,
  permission_ids: formData.permission_ids || formData.permissions || formData.profile?.permissions || undefined,
});

export const userService = {
  listUsers: async (params = {}) => {
    const response = await requestWithEndpointFallback((basePath) =>
      axiosClient.get(basePath, { params })
    );

    const payload = getPayload(response);
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.users)
          ? payload.users
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

    return {
      items: rows.map(mapApiUserToView),
      pagination: payload?.pagination || {},
    };
  },

  createUser: async (formData) => {
    return requestWithEndpointFallback((basePath) =>
      axiosClient.post(basePath, buildCreatePayload(formData))
    );
  },

  updateUser: async (id, formData) => {
    return requestWithEndpointFallback((basePath) =>
      axiosClient.put(`${basePath}/${id}`, buildUpdatePayload(formData))
    );
  },

  deleteUser: async (id) => {
    return requestWithEndpointFallback((basePath) =>
      axiosClient.delete(`${basePath}/${id}`)
    );
  },

  importUsers: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return requestWithEndpointFallback((basePath) =>
      axiosClient.post(`${basePath}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
  },

  downloadImportTemplate: async () => {
    return requestWithEndpointFallback((basePath) =>
      axiosClient.get(`${basePath}/import/template`, {
        responseType: "blob",
      })
    );
  },

  resetPassword: async (userId, { adminPassword, newPassword }) => {
    return requestWithEndpointFallback((basePath) =>
      axiosClient.post(`${basePath}/${userId}/reset-password`, {
        adminPassword,
        newPassword,
      })
    );
  },

  updateStatus: async (userId, status) => {
    return requestWithEndpointFallback((basePath) =>
      axiosClient.put(`${basePath}/${userId}`, {
        status: statusToApi[status] || status,
      })
    );
  },
};

