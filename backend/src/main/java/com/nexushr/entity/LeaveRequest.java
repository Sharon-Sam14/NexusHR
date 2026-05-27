package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/*
 * Leave Request Entity
 *
 * Tracks employee leave applications and approvals.
 */

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee who applied
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /*
     * Leave type
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    /*
     * Leave duration
     */
    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    /*
     * Number of days
     */
    private Integer totalDays;

    /*
     * Reason for leave
     */
    @Column(length = 1000)
    private String reason;

    /*
     * Approval status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    /*
     * Who approved/rejected
     */
    private String approvedBy;

    /*
     * Rejection/approval remarks
     */
    @Column(length = 500)
    private String approvalRemarks;

    /*
     * Application date
     */
    private LocalDate appliedDate;

}