import axiosInstance from "../api/axiosInstance";

export const aiService = {
  getInsights: () => axiosInstance.get("/ai/insights").then(r => r.data),
  chat: (query) => axiosInstance.post("/ai/chat", { query }).then(r => r.data),
};
