package com.nexushr.dto;

import com.nexushr.entity.PayrollStatus;
import lombok.*;

/*
 * Payroll DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PayrollDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String designation;
    private Integer month;
    private Integer year;
    private Double basicSalary;
    private Double bonus;
    private Double deductions;
    private Double tax;
    private Double netSalary;
    private PayrollStatus status;
    private Integer workingDays;
    private Integer daysPresent;
    private String remarks;

}
