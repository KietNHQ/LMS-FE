import axiosClient from "../http/axiosClient";

export const authService = {
  login: async (credentials) => axiosClient.post("/auth/login", credentials),

  forgotPassword: async (email) => axiosClient.post("/auth/forgot-password", { email }),

  resetPassword: async (data) => axiosClient.post("/auth/reset-password", data),

  logout: async () => axiosClient.post("/auth/logout"),

  getMe: async () => axiosClient.get("/auth/me"),

  changePassword: async (data) => axiosClient.post("/auth/change-password", data),

  // Quan ly user cho trang admin
  listUsers: async (params) => axiosClient.get("/auth/users", { params }),

  createUser: async (userData) => axiosClient.post("/auth/users", userData),

  importUsers: async (formData) =>
    axiosClient.post("/auth/users/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  downloadImportTemplate: async () =>
    axiosClient.get("/auth/users/import/template", {
      responseType: "blob",
    }),

  updateUser: async (id, data) => axiosClient.put(`/auth/users/${id}`, data),

  deleteUser: async (id) => axiosClient.delete(`/auth/users/${id}`),
};

