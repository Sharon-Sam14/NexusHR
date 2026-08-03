package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_corrections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceCorrection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    private LocalTime originalCheckIn;
    private LocalTime originalCheckOut;

    @Column(nullable = false)
    private LocalTime correctedCheckIn;

    @Column(nullable = false)
    private LocalTime correctedCheckOut;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(nullable = false)
    private String reason;

    private String requestedBy;
    private String approvedBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
