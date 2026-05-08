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
  if (Array.isArray(payload?.guardians)) return payload.guardians; // /guardians endpoint
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

  // Support data from /guardians endpoint (has given_name/surname fields)
  // OR from /users endpoint (has full_name field)
  let fullName =
    item.fullName ||
    item.full_name ||
    item.name ||
    profile.fullName ||
    profile.full_name ||
    profile.name ||
    '';

  if (!fullName && (item.surname || item.given_name)) {
    fullName = `${item.surname || ''} ${item.given_name || ''}`.trim();
  }
  if (!fullName && item.email) {
    fullName = item.email.split('@')[0];
  }
  if (!fullName) fullName = 'Phụ huynh';

  // Map linked students from /guardians endpoint response (students_linked array)
  // or fall back to profile.children (legacy)
  const linkedStudents = Array.isArray(item.students_linked)
    ? item.students_linked.map(s => ({
        childName: `${s.surname || ''} ${s.given_name || ''}`.trim() || s.name || '',
        childClass: s.class_name || s.className || '',
        studentId: s.id,
      }))
    : [];

  const profileChildren = Array.isArray(profile.children) ? profile.children : [];
  const children = linkedStudents.length > 0 ? linkedStudents : profileChildren;

  return {
    id: item.user_id || item.id,   // always the user UUID for update/RBAC
    guardianTableId: item.id,      // guardian table integer ID (for getStudents API)
    name: fullName,
    dob: item.dob || item.birth_date || profile.dob || '',
    email: item.email || item.user_email || '',
    role: 'Phụ huynh',
    phone: item.phone || profile.phone || '',
    status: statusFromApi[item.status] || statusFromApi[item.user_status] || profile.status || 'Hoạt động',
    profile: {
      ...profile,
      children,
      phone: item.phone || profile.phone || '',
    },
    createdAt: item.createdAt ? `${item.createdAt}`.slice(0, 10) : '',
  };
};

export const parentsService = {
  listParents: async () => {
    // Prefer /guardians endpoint — it has student_guardian join data
    try {
      const response = await axiosClient.get('/guardians', { params: { page: 1, limit: 2000 } });
      const payload = getPayload(response);
      const rows = getRows(payload);
      if (rows.length > 0) return rows.map(parseParent);
    } catch (error) {
      if (error?.response?.status !== 403 && error?.response?.status !== 404) throw error;
    }

    // Fallback to /users?role=guardian
    const userRoleCandidates = ['guardian', 'parent'];
    for (const role of userRoleCandidates) {
      try {
        const response = await axiosClient.get('/users', { params: { role, page: 1, limit: 500 } });
        const payload = getPayload(response);
        const rows = getRows(payload);
        if (rows.length > 0) return rows.map(parseParent);
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 404 && status !== 405) throw error;
      }
    }
    return [];
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

  // Lấy danh sách học sinh đã liên kết với phụ huynh từ BE
  getLinkedStudents: async (guardianUserId) => {
    try {
      // Bước 1: Tìm guardian record từ user_id để lấy guardian table ID
      const guardianRes = await axiosClient.get("/guardians", { params: { search: guardianUserId } });
      const payload = getPayload(guardianRes);
      const guardians = Array.isArray(payload?.guardians) ? payload.guardians
        : Array.isArray(payload?.data) ? payload.data
        : Array.isArray(payload) ? payload : [];

      const guardian = guardians.find(g => g.user_id === guardianUserId);
      if (!guardian) return [];

      // Bước 2: Lấy danh sách học sinh của guardian đó
      const studentsRes = await axiosClient.get(`/guardians/${guardian.id}/students`);
      const studPayload = getPayload(studentsRes);
      const students = Array.isArray(studPayload?.data) ? studPayload.data
        : Array.isArray(studPayload) ? studPayload : [];

      return students.map(s => ({
        id: s.id,
        childName: `${s.surname || ""} ${s.given_name || ""}`.trim() || s.name || "",
        childClass: s.class_name || s.current_class_name || s.className || "",
        studentCode: s.student_code || "",
      }));
    } catch {
      return [];
    }
  },
};



