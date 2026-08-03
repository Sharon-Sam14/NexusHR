package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_sync_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private LocalDateTime syncTime;

    @Column(nullable = false)
    private Integer recordsSynced;

    @Column(nullable = false)
    private String status; // SUCCESS, FAILED

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
