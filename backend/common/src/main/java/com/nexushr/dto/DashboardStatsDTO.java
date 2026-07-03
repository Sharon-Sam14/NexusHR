package com.nexushr.dto;

import lombok.*;

/*
 * Dashboard Stats DTO
 *
 * Aggregated metrics for the admin/HR dashboard.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardStatsDTO {

    private Long totalEmployees;
    private Long activeEmployees;
    private Long presentToday;
    private Long absentToday;
    private Long pendingLeaves;
    private Long approvedLeavesToday;
    private Double totalPayrollThisMonth;
    private Long openJobPositions;
    private Long totalDepartments;
    private Double avgPerformanceRating;
    private Long unreadNotifications;

    // Admin queue counts
    private Long pendingSalaryApprovals;
    private Long pendingPayrollApprovals;
    private Long pendingLeaveRequests;
    private Long attendanceCorrections;
    private Long inactiveEmployees;

    // HR queue counts
    private Long payrollDrafts;
    private Long salaryRequestsSent;
    private Long recruitmentPipelineCount;

    // Dynamic Employee of the Month
    private String bestEmployeeName;
    private String bestEmployeeDesignation;
    private String bestEmployeeDepartment;
    private String bestEmployeeEmail;
    private String bestEmployeePhone;
    private String bestEmployeePhoto;
    private Double bestEmployeeRating;
    private Double bestEmployeeTenure;

}
