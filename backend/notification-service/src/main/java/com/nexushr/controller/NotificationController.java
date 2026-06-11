package com.nexushr.controller;

import com.nexushr.dto.NotificationDTO;
import com.nexushr.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{email}")
    @PreAuthorize("#email == authentication.name")
    public ResponseEntity<List<NotificationDTO>> getForUser(@PathVariable String email) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(email));
    }

    @GetMapping("/unread-count/{email}")
    @PreAuthorize("#email == authentication.name")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String email) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(email)));
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO dto) {
        return ResponseEntity.ok(notificationService.createNotification(dto));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("@securityHelper.isNotificationOwner(#id)")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all/{email}")
    @PreAuthorize("#email == authentication.name")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String email) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.noContent().build();
    }

}
