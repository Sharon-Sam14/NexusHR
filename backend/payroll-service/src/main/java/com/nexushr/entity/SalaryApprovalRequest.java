package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/*
 * SalaryApprovalRequest Entity
 *
 * Models a pending or historical employee salary revision request.
 */
@Entity
@Table(name = "salary_approval_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Double previousSalary;

    @Column(nullable = false)
    private Double proposedSalary;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private String requestedBy;

    @Column(nullable = false)
    private LocalDate requestedDate;

    private String approvedBy;
    private LocalDate actionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SalaryApprovalStatus status = SalaryApprovalStatus.PENDING;

}
