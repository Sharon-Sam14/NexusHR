package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

/*
 * Payroll Entity
 *
 * Stores monthly payroll records for each employee.
 */

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee reference
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /*
     * Payroll period
     */
    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    /*
     * Salary components
     */
    @Column(nullable = false)
    private Double basicSalary;

    @Builder.Default
    private Double bonus = 0.0;

    @Builder.Default
    private Double deductions = 0.0;

    @Builder.Default
    private Double tax = 0.0;

    /*
     * Net salary (calculated)
     */
    private Double netSalary;

    /*
     * Payment status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.PENDING;

    /*
     * Working days in period
     */
    private Integer workingDays;

    /*
     * Days present
     */
    private Integer daysPresent;

    /*
     * Remarks
     */
    private String remarks;

}