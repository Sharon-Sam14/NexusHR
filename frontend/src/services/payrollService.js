import axiosInstance from "../api/axiosInstance";

export const payrollService = {
  getAll: () => axiosInstance.get("/payroll").then(r => r.data),
  getById: (id) => axiosInstance.get(`/payroll/${id}`).then(r => r.data),
  getByEmployee: (id) => axiosInstance.get(`/payroll/employee/${id}`).then(r => r.data),
  getByMonth: (month, year) => axiosInstance.get(`/payroll/month/${month}/year/${year}`).then(r => r.data),
  generate: (data) => axiosInstance.post("/payroll/generate", data).then(r => r.data),
  updateStatus: (id, status) => axiosInstance.patch(`/payroll/${id}/status`, { status }).then(r => r.data),
  runBatch: (data) => axiosInstance.post("/payroll/batch/run", data).then(r => r.data),
};
