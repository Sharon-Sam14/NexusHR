package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/*
 * Recruitment Entity
 *
 * Stores job postings and applicant tracking.
 */

@Entity
@Table(name = "recruitment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recruitment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Job posting details
     */
    @Column(nullable = false)
    private String jobTitle;

    @Column(nullable = false)
    private String department;

    @Column(length = 2000)
    private String jobDescription;

    private String requirements;

    private String location;

    private String jobType;

    private Double salaryMin;

    private Double salaryMax;

    /*
     * Applicant details (when used for tracking an applicant)
     */
    private String applicantName;

    private String applicantEmail;

    private String applicantPhone;

    private String resumeUrl;

    /*
     * Dates
     */
    private LocalDate postedDate;

    private LocalDate closingDate;

    /*
     * Status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecruitmentStatus status = RecruitmentStatus.OPEN;

    /*
     * Number of openings
     */
    @Builder.Default
    private Integer openings = 1;

    /*
     * Posted by
     */
    private String postedBy;

}
