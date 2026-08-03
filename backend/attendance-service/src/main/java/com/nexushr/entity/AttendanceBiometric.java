package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_biometrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceBiometric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private LocalDateTime punchTime;

    @Column(nullable = false)
    private String punchType; // CHECK_IN, CHECK_OUT

    @Builder.Default
    private boolean processed = false;
}
