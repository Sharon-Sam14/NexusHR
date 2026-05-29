package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/*
 * Attendance Entity
 *
 * Records daily check-in/check-out for each employee.
 */

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

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
     * Date of attendance
     */
    @Column(nullable = false)
    private LocalDate date;

    /*
     * Check-in and check-out times
     */
    private LocalTime checkIn;

    private LocalTime checkOut;

    /*
     * Total work hours (calculated)
     */
    private Double workHours;

    /*
     * Attendance status
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    /*
     * Remarks/notes
     */
    private String remarks;

}