import axiosClient from "../../../shared/http/axiosClient";

const getPayload = (response) => response?.data ?? response ?? {};

const statusFromApi = { active: "Hoạt động", inactive: "Khóa" };
const statusToApi = { "Hoạt động": "active", "Khóa": "inactive" };

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
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const composeFullName = (...parts) =>
  parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();

const parseParent = (item = {}) => {
  const profile = item.profile || {};
  const children = Array.isArray(profile.children) ? profile.children : [];
  const fullName =
    item.fullName ||
    item.full_name ||
    item.name ||
    profile.fullName ||
    profile.full_name ||
    profile.name ||
    (
      item.lastName || item.last_name || item.surname || profile.lastName || profile.last_name || profile.surname,
      item.firstName || item.first_name || item.givenName || item.given_name || profile.firstName || profile.first_name || profile.givenName || profile.given_name
    ) ||
    (item.email ? item.email.split("@")[0] : "Phụ huynh");

  return {
    id: item.id,
    name: fullName,
    lastName: item.lastName || item.last_name || item.surname || profile.lastName || profile.last_name || profile.surname || "",
    firstName:
      item.firstName ||
      item.first_name ||
      item.givenName ||
      item.given_name ||
      profile.firstName ||
      profile.first_name ||
      profile.givenName ||
      profile.given_name ||
      "",
    dob: item.dob || profile.dob || "",
    email: item.email || "",
    role: "Phụ huynh",
    phone: item.phone || profile.phone || "",
    status: statusFromApi[item.status] || profile.status || "Hoạt động",
    profile: {
      ...profile,
      children,
      phone: item.phone || profile.phone || "",
    },
    createdAt: item.createdAt ? `${item.createdAt}`.slice(0, 10) : "",
  };
};

export const parentsService = {
  listParents: async () => {
    const userRoleCandidates = ["guardian", "parent"];

    for (const role of userRoleCandidates) {
      try {
        const response = await axiosClient.get("/users", {
          params: { role, page: 1, limit: 500 },
        });
        const payload = getPayload(response);
        const rows = getRows(payload);
        if (rows.length > 0) {
          return rows.map(parseParent);
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 404 && status !== 405) {
          throw error;
        }
      }
    }

    const response = await requestWithFallback(["/guardians"], (basePath) =>
      axiosClient.get(basePath, { params: { page: 1, limit: 2000 } })
    );

    return getRows(getPayload(response)).map(parseParent);
  },

  createParent: async (formData) => {
    const payload = {
      email: formData.email,
      fullName: formData.name,
      role: "guardian",
      phone: formData.phone === "—" ? "" : formData.phone,
      dob: formData.dob || null,
      profile: formData.profile || {},
    };

    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.post(basePath, payload));
  },

  updateParent: async (id, formData) => {
    const payload = {
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone === "—" ? "" : formData.phone,
      dob: formData.dob || null,
      status: statusToApi[formData.status] || undefined,
      profile: {
        ...(formData.profile || {}),
        children: formData.profile?.children || [],
        phone: formData.phone === "—" ? "" : formData.phone,
      },
    };

    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.put(`${basePath}/${id}`, payload));
  },

  deleteParent: async (id) => {
    return requestWithFallback(["/users", "/auth/users"], (basePath) => axiosClient.delete(`${basePath}/${id}`));
  },

  importParents: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return requestWithFallback(["/users/import", "/auth/users/import"], (path) =>
      axiosClient.post(path, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  downloadTemplate: async () => {
    return requestWithFallback(["/users/import/template", "/auth/users/import/template"], (path) =>
      axiosClient.get(path, { responseType: "blob" })
    );
  },
};



