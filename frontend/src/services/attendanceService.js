import axiosInstance from "../api/axiosInstance";

export const attendanceService = {
  getAll: () => axiosInstance.get("/attendance").then(r => r.data),
  getByEmployee: (id) => axiosInstance.get(`/attendance/employee/${id}`).then(r => r.data),
  getByDate: (date) => axiosInstance.get(`/attendance/date/${date}`).then(r => r.data),
  checkIn: (employeeId) => axiosInstance.post(`/attendance/check-in/${employeeId}`).then(r => r.data),
  checkOut: (employeeId) => axiosInstance.post(`/attendance/check-out/${employeeId}`).then(r => r.data),
  create: (data) => axiosInstance.post("/attendance", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/attendance/${id}`, data).then(r => r.data),
};
