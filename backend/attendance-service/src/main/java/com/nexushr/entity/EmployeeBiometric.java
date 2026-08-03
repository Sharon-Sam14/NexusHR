package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_biometrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeBiometric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String biometricType; // CARD, FINGERPRINT, FACE, IRIS

    @Column(columnDefinition = "TEXT")
    private String biometricTemplate;

    private String cardId;

    @Builder.Default
    private boolean enabled = true;

    private LocalDateTime lastSyncedAt;
}
