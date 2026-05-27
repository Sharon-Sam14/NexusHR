import axiosInstance from "../api/axiosInstance";

export const notificationService = {
  getForUser: (email) => axiosInstance.get(`/notifications/user/${email}`).then(r => r.data),
  getUnreadCount: (email) => axiosInstance.get(`/notifications/unread-count/${email}`).then(r => r.data),
  create: (data) => axiosInstance.post("/notifications", data).then(r => r.data),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: (email) => axiosInstance.patch(`/notifications/read-all/${email}`),
};
