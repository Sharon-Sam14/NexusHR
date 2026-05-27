package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/*
 * Performance Entity
 *
 * Stores performance review records for employees.
 */

@Entity
@Table(name = "performance_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee being reviewed
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /*
     * Review period
     */
    @Column(nullable = false)
    private String reviewPeriod;

    private LocalDate reviewDate;

    /*
     * Ratings (1–5 scale)
     */
    @Column(nullable = false)
    private Double overallRating;

    private Double productivityRating;

    private Double qualityRating;

    private Double teamworkRating;

    private Double communicationRating;

    /*
     * Comments
     */
    @Column(length = 2000)
    private String comments;

    private String goals;

    /*
     * Reviewer name
     */
    private String reviewedBy;

    /*
     * Status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PerformanceStatus status = PerformanceStatus.DRAFT;

}
