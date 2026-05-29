package com.nexushr.service;

import com.nexushr.dto.AttendanceDTO;

import java.time.LocalDate;
import java.util.List;

/*
 * Attendance Service Interface
 */
public interface AttendanceService {

    AttendanceDTO checkIn(Long employeeId);

    AttendanceDTO checkOut(Long employeeId);

    List<AttendanceDTO> getAllAttendance();

    List<AttendanceDTO> getAttendanceByEmployee(Long employeeId);

    List<AttendanceDTO> getAttendanceByDate(LocalDate date);

    AttendanceDTO createAttendance(AttendanceDTO dto);

    AttendanceDTO updateAttendance(Long id, AttendanceDTO dto);

}