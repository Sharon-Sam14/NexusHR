import axiosInstance from "../api/axiosInstance";

export const performanceService = {
  getAll: () => axiosInstance.get("/performance").then(r => r.data),
  getById: (id) => axiosInstance.get(`/performance/${id}`).then(r => r.data),
  getByEmployee: (id) => axiosInstance.get(`/performance/employee/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post("/performance", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/performance/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/performance/${id}`),
};
