import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor — attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nexushr_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 unauthorized and rotate token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url && !originalRequest.url.includes("/auth/")) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("nexushr_refresh_token");

      if (refreshToken) {
        try {
          // Use standard axios to avoid recursion in axiosInstance
          const response = await axios.post("/api/auth/refresh", { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem("nexushr_token", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("nexushr_refresh_token", newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
        }
      }

      localStorage.removeItem("nexushr_token");
      localStorage.removeItem("nexushr_refresh_token");
      localStorage.removeItem("nexushr_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
