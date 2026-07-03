import axiosInstance from "../api/axiosInstance";

export const userService = {
  getAll: () => axiosInstance.get("/users").then(r => r.data),
  createHr: (data) => axiosInstance.post("/users/create-hr", data).then(r => r.data),
  updateRole: (id, role) => axiosInstance.patch(`/users/${id}/role`, { role }).then(r => r.data),
  resetPassword: (id, password) => axiosInstance.post(`/users/${id}/reset-password`, { password }).then(r => r.data),
  lockAccount: (id, active) => axiosInstance.patch(`/users/${id}/lock`, { active }).then(r => r.data),
};
