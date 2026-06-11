import axiosInstance from "../api/axiosInstance";

export const dashboardService = {
  getStats: () => axiosInstance.get("/dashboard/stats").then(r => r.data),
};
