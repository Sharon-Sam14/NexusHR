import axiosInstance from "../api/axiosInstance";

export const performanceService = {
  getAll: () => axiosInstance.get("/performance").then(r => r.data),
  getById: (id) => axiosInstance.get(`/performance/${id}`).then(r => r.data),
  getByEmployee: (id) => axiosInstance.get(`/performance/employee/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post("/performance", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/performance/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/performance/${id}`),
  createGoal: (data) => axiosInstance.post("/performance/goals", data).then(r => r.data),
  getGoalsByEmployee: (employeeId) => axiosInstance.get(`/performance/goals/employee/${employeeId}`).then(r => r.data),
  updateGoalProgress: (id, progressPercent) => axiosInstance.patch(`/performance/goals/${id}/progress`, { progressPercent }).then(r => r.data),
  updateGoalStatus: (id, status) => axiosInstance.patch(`/performance/goals/${id}/status`, { status }).then(r => r.data),
  deleteGoal: (id) => axiosInstance.delete(`/performance/goals/${id}`),
};
