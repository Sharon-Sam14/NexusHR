package com.nexushr.dto;

import com.nexushr.entity.PerformanceStatus;
import lombok.*;

import java.time.LocalDate;

/*
 * Performance DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PerformanceDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String reviewPeriod;
    private LocalDate reviewDate;
    private Double overallRating;
    private Double productivityRating;
    private Double qualityRating;
    private Double teamworkRating;
    private Double communicationRating;
    private String comments;
    private String goals;
    private String reviewedBy;
    private PerformanceStatus status;

}
