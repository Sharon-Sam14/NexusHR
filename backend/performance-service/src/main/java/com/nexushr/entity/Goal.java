package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/*
 * Goal Entity
 *
 * Represents a performance goal assigned to an employee.
 * Tracked in the performance module within the 360-review cycle.
 */
@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee who owns this goal
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /*
     * Goal title and full description
     */
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    /*
     * Review quarter / period association
     */
    private String reviewPeriod;

    /*
     * Target deadline
     */
    private LocalDate targetDate;

    /*
     * Progress percentage: 0–100
     */
    @Builder.Default
    private Integer progressPercent = 0;

    /*
     * Goal completion status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    /*
     * Who set/reviewed this goal
     */
    private String setBy;
}
