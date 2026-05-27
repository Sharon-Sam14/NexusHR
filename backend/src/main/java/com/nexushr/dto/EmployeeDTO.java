package com.nexushr.dto;

import com.nexushr.entity.EmployeeStatus;
import lombok.*;

import java.time.LocalDate;

/*
 * Employee DTO
 *
 * Used for both request and response.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeDTO {

    private Long id;
    private String employeeName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;
    private String profilePhoto;
    private String address;
    private EmployeeStatus status;
    private String gender;
    private LocalDate dateOfBirth;
    private String emergencyContact;

}
