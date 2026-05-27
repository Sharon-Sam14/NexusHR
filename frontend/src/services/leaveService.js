import axiosInstance from "../api/axiosInstance";

export const leaveService = {
  getAll: () => axiosInstance.get("/leave").then(r => r.data),
  getPending: () => axiosInstance.get("/leave/pending").then(r => r.data),
  getByEmployee: (id) => axiosInstance.get(`/leave/employee/${id}`).then(r => r.data),
  apply: (data) => axiosInstance.post("/leave/apply", data).then(r => r.data),
  approve: (id, approvedBy, remarks) =>
    axiosInstance.patch(`/leave/${id}/approve`, { approvedBy, remarks }).then(r => r.data),
  reject: (id, approvedBy, remarks) =>
    axiosInstance.patch(`/leave/${id}/reject`, { approvedBy, remarks }).then(r => r.data),
  cancel: (id) => axiosInstance.patch(`/leave/${id}/cancel`).then(r => r.data),
};
