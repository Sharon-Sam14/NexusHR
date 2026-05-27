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

// Response interceptor — handle 401 unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nexushr_token");
      localStorage.removeItem("nexushr_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
