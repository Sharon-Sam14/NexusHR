package com.nexushr.dto;

import com.nexushr.entity.AttendanceStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/*
 * Attendance DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttendanceDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private Double workHours;
    private AttendanceStatus status;
    private String remarks;

}
