package com.nexushr.service.impl;

import com.nexushr.dto.NotificationDTO;
import com.nexushr.entity.Notification;
import com.nexushr.repository.NotificationRepository;
import com.nexushr.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationDTO createNotification(NotificationDTO dto) {
        Notification notification = Notification.builder()
                .userEmail(dto.getUserEmail())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(dto.getType())
                .read(false)
                .createdAt(LocalDateTime.now())
                .actionUrl(dto.getActionUrl())
                .build();
        return toDTO(notificationRepository.save(notification));
    }

    @Override
    public List<NotificationDTO> getNotificationsForUser(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public NotificationDTO markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return toDTO(notificationRepository.save(n));
    }

    @Override
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByUserEmailAndRead(email, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndRead(email, false);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId()).userEmail(n.getUserEmail()).title(n.getTitle())
                .message(n.getMessage()).type(n.getType()).read(n.isRead())
                .createdAt(n.getCreatedAt()).actionUrl(n.getActionUrl())
                .build();
    }
}
