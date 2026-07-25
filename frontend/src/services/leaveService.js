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

  /**
   * Upload a medical certificate document for an employee before applying sick leave.
   * Returns a DocumentDTO including the document ID to attach to the leave request.
   *
   * @param {number} employeeId  - Employee's ID
   * @param {File}   file        - The file to upload (PDF, JPG, PNG, max 10MB)
   * @param {Function} onProgress - Optional upload progress callback (0–100)
   */
  uploadMedicalDocument: (employeeId, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", "MEDICAL_CERTIFICATE");

    return axiosInstance.post(`/employees/${employeeId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    }).then(r => r.data);
  },

  /**
   * Get a specific document by its ID.
   */
  getDocument: (docId) => axiosInstance.get(`/employees/documents/${docId}`).then(r => r.data),
};
