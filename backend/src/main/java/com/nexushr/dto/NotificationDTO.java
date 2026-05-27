package com.nexushr.dto;

import lombok.*;

import java.time.LocalDateTime;

/*
 * Notification DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationDTO {

    private Long id;
    private String userEmail;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;
    private String actionUrl;

}
