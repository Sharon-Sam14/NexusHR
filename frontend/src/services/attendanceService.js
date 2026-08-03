import axiosInstance from "../api/axiosInstance";

export const attendanceService = {
  getAll: () => axiosInstance.get("/attendance").then(r => r.data),
  getByEmployee: (id) => axiosInstance.get(`/attendance/employee/${id}`).then(r => r.data),
  getByDate: (date) => axiosInstance.get(`/attendance/date/${date}`).then(r => r.data),
  checkIn: (employeeId) => axiosInstance.post(`/attendance/check-in/${employeeId}`).then(r => r.data),
  checkOut: (employeeId) => axiosInstance.post(`/attendance/check-out/${employeeId}`).then(r => r.data),
  create: (data) => axiosInstance.post("/attendance", data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/attendance/${id}`, data).then(r => r.data),

  // Biometric Devices
  getDevices: () => axiosInstance.get("/biometric/devices").then(r => r.data),
  createDevice: (data) => axiosInstance.post("/biometric/devices", data).then(r => r.data),
  updateDevice: (id, data) => axiosInstance.put(`/biometric/devices/${id}`, data).then(r => r.data),
  deleteDevice: (id) => axiosInstance.delete(`/biometric/devices/${id}`).then(r => r.data),
  testDeviceConnection: (id) => axiosInstance.post(`/biometric/devices/${id}/test-connection`).then(r => r.data),
  syncDevice: (id) => axiosInstance.post(`/biometric/devices/${id}/sync`).then(r => r.data),

  // Biometric Enrollments
  getEnrollments: () => axiosInstance.get("/biometric/enroll").then(r => r.data),
  getEnrollmentsByEmployee: (empId) => axiosInstance.get(`/biometric/enroll/${empId}`).then(r => r.data),
  enrollEmployee: (data) => axiosInstance.post("/biometric/enroll", data).then(r => r.data),
  deleteEnrollment: (id) => axiosInstance.delete(`/biometric/enroll/${id}`).then(r => r.data),
  toggleEnrollment: (id) => axiosInstance.put(`/biometric/enroll/${id}/toggle`).then(r => r.data),

  // Shift Configurations
  getShifts: () => axiosInstance.get("/biometric/shifts").then(r => r.data),
  saveShift: (data) => axiosInstance.post("/biometric/shifts", data).then(r => r.data),
  deleteShift: (id) => axiosInstance.delete(`/biometric/shifts/${id}`).then(r => r.data),

  // Holiday Calendar
  getHolidays: () => axiosInstance.get("/biometric/holidays").then(r => r.data),
  saveHoliday: (data) => axiosInstance.post("/biometric/holidays", data).then(r => r.data),
  deleteHoliday: (id) => axiosInstance.delete(`/biometric/holidays/${id}`).then(r => r.data),

  // Attendance Corrections
  getCorrections: () => axiosInstance.get("/biometric/corrections").then(r => r.data),
  getCorrectionsByEmployee: (empId) => axiosInstance.get(`/biometric/corrections/employee/${empId}`).then(r => r.data),
  applyCorrection: (data) => axiosInstance.post("/biometric/corrections", data).then(r => r.data),
  approveCorrection: (id) => axiosInstance.post(`/biometric/corrections/${id}/approve`).then(r => r.data),
  rejectCorrection: (id) => axiosInstance.post(`/biometric/corrections/${id}/reject`).then(r => r.data),
};
