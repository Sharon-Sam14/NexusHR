package com.nexushr.dto;

import com.nexushr.entity.SalaryApprovalStatus;
import lombok.*;
import java.time.LocalDate;

/*
 * Salary Approval Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryApprovalRequestDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String designation;
    private Double previousSalary;
    private Double proposedSalary;
    private String reason;
    private String requestedBy;
    private LocalDate requestedDate;
    private SalaryApprovalStatus status;
    private String approvedBy;
    private LocalDate actionDate;

}
