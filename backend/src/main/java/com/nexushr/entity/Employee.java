package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/*
 * Employee Entity
 *
 * Stores complete employee profile information.
 */

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee personal info
     */
    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    /*
     * Employment details
     */
    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private Double salary;

    private LocalDate joiningDate;

    /*
     * Profile picture URL
     */
    private String profilePhoto;

    /*
     * Address
     */
    private String address;

    /*
     * Employment status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    /*
     * Gender
     */
    private String gender;

    /*
     * Date of Birth
     */
    private LocalDate dateOfBirth;

    /*
     * Emergency contact
     */
    private String emergencyContact;

}