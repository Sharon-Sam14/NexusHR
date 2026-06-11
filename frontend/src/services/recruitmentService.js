import axiosInstance from "../api/axiosInstance";

export const recruitmentService = {
  getAll: () => axiosInstance.get("/recruitment").then(r => r.data),
  getById: (id) => axiosInstance.get(`/recruitment/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post("/recruitment", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/recruitment/${id}`, data).then(r => r.data),
  updateStatus: (id, status) => axiosInstance.patch(`/recruitment/${id}/status`, { status }).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/recruitment/${id}`),
};
