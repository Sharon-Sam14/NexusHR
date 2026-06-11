package com.nexushr.dto;

import com.nexushr.entity.RecruitmentStatus;
import lombok.*;

import java.time.LocalDate;

/*
 * Recruitment DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecruitmentDTO {

    private Long id;
    private String jobTitle;
    private String department;
    private String jobDescription;
    private String requirements;
    private String location;
    private String jobType;
    private Double salaryMin;
    private Double salaryMax;
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String resumeUrl;
    private LocalDate postedDate;
    private LocalDate closingDate;
    private RecruitmentStatus status;
    private Integer openings;
    private String postedBy;

}
