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

}
