package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/*
 * Notification Entity
 *
 * Stores in-app notifications for users.
 */

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Target user email
     */
    @Column(nullable = false)
    private String userEmail;

    /*
     * Notification content
     */
    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    /*
     * Notification type/category
     */
    private String type;

    /*
     * Read status
     */
    @Builder.Default
    private boolean read = false;

    /*
     * Creation timestamp
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /*
     * Optional link/action
     */
    private String actionUrl;

}
