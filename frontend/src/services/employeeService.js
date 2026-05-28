import axiosInstance from "../api/axiosInstance";

export const employeeService = {
  getAll: () => axiosInstance.get("/employees").then(r => r.data),
  getById: (id) => axiosInstance.get(`/employees/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post("/employees", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/employees/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/employees/${id}`).then(r => r.data),
  getByDepartment: (dept) => axiosInstance.get(`/employees/department/${dept}`).then(r => r.data),
  getDocuments: (employeeId) => axiosInstance.get(`/employees/${employeeId}/documents`).then(r => r.data),
  uploadDocument: (employeeId, formData) => axiosInstance.post(`/employees/${employeeId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(r => r.data),
  deleteDocument: (id) => axiosInstance.delete(`/documents/${id}`).then(r => r.data),
};
