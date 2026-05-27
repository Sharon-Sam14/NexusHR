package com.nexushr.service;

import com.nexushr.dto.NotificationDTO;
import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(NotificationDTO dto);
    List<NotificationDTO> getNotificationsForUser(String email);
    NotificationDTO markAsRead(Long id);
    void markAllAsRead(String email);
    long getUnreadCount(String email);
}
