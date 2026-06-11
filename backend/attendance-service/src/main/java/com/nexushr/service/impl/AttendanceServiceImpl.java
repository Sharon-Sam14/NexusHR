package com.nexushr.service.impl;

import com.nexushr.dto.AttendanceDTO;
import com.nexushr.entity.Attendance;
import com.nexushr.entity.AttendanceStatus;
import com.nexushr.entity.Employee;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.service.AttendanceEventPublisher;
import com.nexushr.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;


/*
 * Attendance Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceEventPublisher attendanceEventPublisher;

    @Override
    public AttendanceDTO checkIn(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate today = LocalDate.now();
        attendanceRepository.findFirstByEmployeeIdAndDate(employeeId, today)
                .ifPresent(a -> { throw new RuntimeException("Already checked in today"); });

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .checkIn(LocalTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        attendanceEventPublisher.publishPunch(saved, "CHECK_IN");
        return toDTO(saved);
    }

    @Override
    public AttendanceDTO checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findFirstByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        attendance.setCheckOut(LocalTime.now());

        if (attendance.getCheckIn() != null) {
            long minutes = ChronoUnit.MINUTES.between(attendance.getCheckIn(), attendance.getCheckOut());
            attendance.setWorkHours(Math.round(minutes / 60.0 * 100.0) / 100.0);
        }

        Attendance saved = attendanceRepository.save(attendance);
        attendanceEventPublisher.publishPunch(saved, "CHECK_OUT");
        return toDTO(saved);
    }

    @Override
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDTO> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public AttendanceDTO createAttendance(AttendanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .workHours(dto.getWorkHours())
                .status(dto.getStatus() != null ? dto.getStatus() : AttendanceStatus.PRESENT)
                .remarks(dto.getRemarks())
                .build();

        return toDTO(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));

        existing.setCheckIn(dto.getCheckIn());
        existing.setCheckOut(dto.getCheckOut());
        existing.setWorkHours(dto.getWorkHours());
        existing.setStatus(dto.getStatus());
        existing.setRemarks(dto.getRemarks());

        return toDTO(attendanceRepository.save(existing));
    }

    private AttendanceDTO toDTO(Attendance a) {
        return AttendanceDTO.builder()
                .id(a.getId())
                .employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getEmployeeName())
                .department(a.getEmployee().getDepartment())
                .date(a.getDate())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .workHours(a.getWorkHours())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .build();
    }

}