import axiosInstance from "../api/axiosInstance";

export const departmentService = {
  getAll: () => axiosInstance.get("/departments").then(r => r.data),
  create: (data) => axiosInstance.post("/departments", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/departments/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/departments/${id}`),
};
