import axiosInstance from "../api/axiosInstance";

export const aiService = {
  getInsights: () => axiosInstance.get("/ai/insights").then(r => r.data),
};
