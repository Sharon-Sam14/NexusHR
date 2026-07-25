package com.nexushr.service;

import com.nexushr.dto.AttendanceDTO;
import com.nexushr.dto.BiometricAttendanceDTO;
import com.nexushr.entity.*;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveRequestRepository;
import com.nexushr.util.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BiometricAttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceEventPublisher attendanceEventPublisher;

    public AttendanceDTO processBiometricPunch(BiometricAttendanceDTO dto) {
        log.info("[BIOMETRIC] Processing punch: Employee={}, Type={}, Time={}", dto.getEmployeeId(), dto.getType(), dto.getTimestamp());

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + dto.getEmployeeId()));

        LocalDate date = dto.getTimestamp().toLocalDate();
        LocalTime time = dto.getTimestamp().toLocalTime();

        // 1. Check Leave Integration: If employee has approved leave for today, block biometric punches
        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByEmployeeIdAndStatus(employee.getId(), LeaveStatus.APPROVED);
        boolean onLeave = approvedLeaves.stream()
                .anyMatch(lr -> !date.isBefore(lr.getStartDate()) && !date.isAfter(lr.getEndDate()));

        if (onLeave) {
            throw new RuntimeException("Biometric punch rejected: Employee is currently on approved leave.");
        }

        // 2. Fetch today's record or build a new one
        Attendance attendance = attendanceRepository.findFirstByEmployeeIdAndDate(employee.getId(), date)
                .orElse(Attendance.builder()
                        .employee(employee)
                        .date(date)
                        .build());

        String punchType = dto.getType().toUpperCase();
        if ("CHECK_IN".equals(punchType)) {
            attendance.setCheckIn(time);

            // Late check-in logic (9:15 AM threshold)
            if (time.isAfter(LocalTime.of(9, 15))) {
                attendance.setStatus(AttendanceStatus.LATE);
                attendance.setRemarks("Biometric late arrival (" + dto.getDeviceId() + ")");
            } else {
                attendance.setStatus(AttendanceStatus.PRESENT);
                attendance.setRemarks("Biometric check-in (" + dto.getDeviceId() + ")");
            }

            // Weekend overtime flag
            DayOfWeek day = date.getDayOfWeek();
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
                attendance.setRemarks("Biometric weekend overtime (" + dto.getDeviceId() + ")");
            }

        } else if ("CHECK_OUT".equals(punchType)) {
            attendance.setCheckOut(time);
            if (attendance.getCheckIn() == null) {
                attendance.setCheckIn(LocalTime.of(9, 0)); // Fallback check-in
            }

            long minutes = ChronoUnit.MINUTES.between(attendance.getCheckIn(), time);
            double hours = Math.round((minutes / 60.0) * 100.0) / 100.0;
            attendance.setWorkHours(hours);

            // Re-resolve status based on hours
            if (hours < 4.0) {
                attendance.setStatus(AttendanceStatus.HALF_DAY);
            }

            if (attendance.getRemarks() == null) {
                attendance.setRemarks("Biometric check-out (" + dto.getDeviceId() + ")");
            } else {
                attendance.setRemarks(attendance.getRemarks() + " / check-out (" + dto.getDeviceId() + ")");
            }

        } else {
            throw new IllegalArgumentException("Invalid biometric punch type: " + dto.getType());
        }

        Attendance saved = attendanceRepository.save(attendance);

        // 3. Audit Log
        AuditLogger.log("SYSTEM", "BIOMETRIC_PUNCH", employee.getEmployeeName(),
                "Device: " + dto.getDeviceId() + ", Punch: " + punchType + ", Time: " + time);

        // 4. SSE real-time broadcast
        attendanceEventPublisher.publishPunch(saved, punchType);

        return toDTO(saved);
    }

    private AttendanceDTO toDTO(Attendance att) {
        return AttendanceDTO.builder()
                .id(att.getId())
                .employeeId(att.getEmployee().getId())
                .employeeName(att.getEmployee().getEmployeeName())
                .department(att.getEmployee().getDepartment())
                .date(att.getDate())
                .checkIn(att.getCheckIn())
                .checkOut(att.getCheckOut())
                .workHours(att.getWorkHours())
                .status(att.getStatus())
                .remarks(att.getRemarks())
                .build();
    }
}
