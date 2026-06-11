package com.nexushr.dto;

import com.nexushr.entity.LeaveStatus;
import com.nexushr.entity.LeaveType;
import lombok.*;

import java.time.LocalDate;

/*
 * Leave Request DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaveRequestDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private String reason;
    private LeaveStatus status;
    private String approvedBy;
    private String approvalRemarks;
    private LocalDate appliedDate;

}
