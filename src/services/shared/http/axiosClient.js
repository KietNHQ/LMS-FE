import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor 1: Tu dong gan JWT vao request
axiosClient.interceptors.request.use((config) => {
  // Chỉ lấy từ localStorage nếu có cờ isPersistent=true
  const isPersistent = localStorage.getItem("isPersistent") === "true";
  const token = sessionStorage.getItem("accessToken") || (isPersistent ? localStorage.getItem("accessToken") : null);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

// Interceptor 2: Bat 401 va thu refresh token
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const errorData = error.response?.data;

    // 1. Xu ly loi bat buoc doi mat khau (BE Issue #10)
    if (error.response?.status === 403 && (errorData?.error === "REQUIRE_PASSWORD_CHANGE" || errorData?.message?.includes("đổi mật khẩu"))) {
      // Phát sự kiện toàn hệ thống để các Layout bắt được và hiện Dialog
      window.dispatchEvent(new CustomEvent("require-password-change"));
      console.warn("User must change password:", errorData.message);
      return Promise.reject(error);
    }

    // 2. Bat 401 va thu refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/refresh")) {
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
        const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Khong co refresh token -> Buoc logout ngay lap tuc
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = res.data.data;

        // [STRICT] Chỉ lưu vào localStorage nếu refreshToken cũng đang nằm ở đó
        // Điều này ngăn chặn việc token "nhảy" sang localStorage khi đang ở chế độ Session
        const isPersistent = !!localStorage.getItem("refreshToken");
        const storage = isPersistent ? localStorage : sessionStorage;

        storage.setItem("accessToken", accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (_error) {
        processQueue(_error, null);
        
        // Neu refresh that bai -> Xoa sach du lieu va logout
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login?expired=true";
        
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;


