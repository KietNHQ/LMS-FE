import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Ho tro dong bo request khi refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthStorage = () => {
  const authItems = [
    "accessToken",
    "refreshToken",
    "user",
    "userRole",
    "isPersistent",
    "tab_session_id",
    "teacher_unread_notifications_count",
    "student_unread_notifications_count",
    "parent_unread_notifications_count",
    "admin_unread_notifications_count",
  ];
  authItems.forEach((item) => {
    localStorage.removeItem(item);
    sessionStorage.removeItem(item);
  });
};

// Interceptor 1: Gan JWT + Debug log request
axiosClient.interceptors.request.use(
  (config) => {
    // [DEBUG] Log all API requests
    console.log(`📤 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params,
      data: config.data,
    });

    // Tu dong gan JWT vao request
    const isPersistent = localStorage.getItem("isPersistent") === "true";
    const token =
      sessionStorage.getItem("accessToken") ||
      (isPersistent ? localStorage.getItem("accessToken") : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Prevent ETag 304 caching - remove If-None-Match header
    delete config.headers["If-None-Match"];
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor 2: Debug log response + Xu ly 401/403
axiosClient.interceptors.response.use(
  (response) => {
    // Handle 304 Not Modified - return null so callers can distinguish from empty data
    if (response.status === 304) {
      console.log(`📥 [API] Response ${response.config.url}: 304 Not Modified`);
      return null;
    }

    // [DEBUG] Log all API responses
    console.log(`📥 [API] Response ${response.config.url}:`, response.data);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorData = error.response?.data;

    // [DEBUG] Log errors
    console.error(`❌ [API] Error ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // 1. Xu ly loi bat buoc doi mat khau (BE Issue #10)
    if (
      error.response?.status === 403 &&
      (errorData?.error === "REQUIRE_PASSWORD_CHANGE" ||
        errorData?.message?.includes("đổi mật khẩu"))
    ) {
      window.dispatchEvent(new CustomEvent("require-password-change"));
      console.warn("User must change password:", errorData.message);
      return Promise.reject(error);
    }

    // 2. Bat 401 va thu refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          clearAuthStorage();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
        );

        const { accessToken } = res.data.data;

        const isPersistent = !!localStorage.getItem("refreshToken");
        const storage = isPersistent ? localStorage : sessionStorage;

        storage.setItem("accessToken", accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (_error) {
        processQueue(_error, null);

        // FIX: Clear ALL auth storage before redirect to prevent:
        // 1. Refresh loop where stale tokens cause repeated 401 -> refresh -> fail
        // 2. Login page redirect loops where RootRedirect sees leftover tokens
        clearAuthStorage();
        window.location.href = "/login?expired=true";

        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
