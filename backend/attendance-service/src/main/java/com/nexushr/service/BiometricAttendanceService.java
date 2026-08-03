package com.nexushr.service;

import com.nexushr.dto.AttendanceDTO;
import com.nexushr.dto.BiometricAttendanceDTO;
import com.nexushr.entity.*;
import com.nexushr.repository.*;
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
    private final ShiftConfigurationRepository shiftConfigurationRepository;
    private final HolidayCalendarRepository holidayCalendarRepository;

    public AttendanceDTO processBiometricPunch(BiometricAttendanceDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Biometric DTO cannot be null");
        }
        if (dto.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee ID is required");
        }
        if (dto.getType() == null) {
            throw new IllegalArgumentException("Punch type is required");
        }
        if (dto.getTimestamp() == null) {
            dto.setTimestamp(java.time.LocalDateTime.now());
        }

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

        // 2. Resolve Shift Configuration
        ShiftConfiguration shift = shiftConfigurationRepository.findAll().stream()
                .findFirst()
                .orElse(ShiftConfiguration.builder()
                        .shiftName("Standard Shift")
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(18, 0))
                        .graceTimeMinutes(15)
                        .halfDayThresholdHours(4.0)
                        .fullDayHours(8.0)
                        .isNightShift(false)
                        .build());

        // 3. Resolve Holiday & Weekend
        boolean isHoliday = holidayCalendarRepository.findByHolidayDate(date).isPresent();
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        boolean isWeekend = dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;

        // 4. Fetch today's record or build a new one
        Attendance attendance = attendanceRepository.findFirstByEmployeeIdAndDate(employee.getId(), date)
                .orElse(Attendance.builder()
                        .employee(employee)
                        .date(date)
                        .build());

        String punchType = dto.getType().toUpperCase();
        if ("CHECK_IN".equals(punchType)) {
            // Duplicate check-in prevention
            if (attendance.getCheckIn() != null) {
                long diff = Math.abs(ChronoUnit.MINUTES.between(attendance.getCheckIn(), time));
                if (diff < 5) {
                    log.info("[BIOMETRIC] Duplicate check-in punch within 5 mins ignored for employee {}", employee.getId());
                    return toDTO(attendance);
                }
            }

            attendance.setCheckIn(time);

            // Late check-in logic
            LocalTime lateThreshold = shift.getStartTime().plusMinutes(shift.getGraceTimeMinutes());
            if (time.isAfter(lateThreshold)) {
                attendance.setStatus(AttendanceStatus.LATE);
                attendance.setRemarks("Biometric late arrival (" + dto.getDeviceId() + ")");
            } else {
                attendance.setStatus(AttendanceStatus.PRESENT);
                attendance.setRemarks("Biometric check-in (" + dto.getDeviceId() + ")");
            }

            if (isHoliday) {
                attendance.setStatus(AttendanceStatus.HOLIDAY);
                attendance.setRemarks("Biometric Holiday check-in (" + dto.getDeviceId() + ")");
            } else if (isWeekend) {
                attendance.setStatus(AttendanceStatus.WEEKEND);
                attendance.setRemarks("Biometric weekend check-in (" + dto.getDeviceId() + ")");
            }

        } else if ("CHECK_OUT".equals(punchType)) {
            // Duplicate check-out prevention
            if (attendance.getCheckOut() != null) {
                long diff = Math.abs(ChronoUnit.MINUTES.between(attendance.getCheckOut(), time));
                if (diff < 5) {
                    log.info("[BIOMETRIC] Duplicate check-out punch within 5 mins ignored for employee {}", employee.getId());
                    return toDTO(attendance);
                }
            }

            attendance.setCheckOut(time);
            if (attendance.getCheckIn() == null) {
                // Fallback check-in based on shift start
                attendance.setCheckIn(shift.getStartTime());
            }

            long minutes = ChronoUnit.MINUTES.between(attendance.getCheckIn(), time);
            double hours = Math.round((minutes / 60.0) * 100.0) / 100.0;
            attendance.setWorkHours(hours);

            // Resolve status based on hours and late arrival status
            if (hours < shift.getHalfDayThresholdHours()) {
                attendance.setStatus(AttendanceStatus.HALF_DAY);
            } else {
                // If it was late, preserve LATE, otherwise set to PRESENT (if not holiday/weekend)
                if (isHoliday) {
                    attendance.setStatus(AttendanceStatus.HOLIDAY);
                } else if (isWeekend) {
                    attendance.setStatus(AttendanceStatus.WEEKEND);
                } else if (attendance.getCheckIn().isAfter(shift.getStartTime().plusMinutes(shift.getGraceTimeMinutes()))) {
                    attendance.setStatus(AttendanceStatus.LATE);
                } else {
                    attendance.setStatus(AttendanceStatus.PRESENT);
                }
            }

            String remarkDetail = isHoliday ? "Holiday work" : (isWeekend ? "Weekend overtime" : "check-out");
            if (attendance.getRemarks() == null) {
                attendance.setRemarks("Biometric " + remarkDetail + " (" + dto.getDeviceId() + ")");
            } else {
                attendance.setRemarks(attendance.getRemarks() + " / " + remarkDetail + " (" + dto.getDeviceId() + ")");
            }

        } else {
            throw new IllegalArgumentException("Invalid biometric punch type: " + dto.getType());
        }

        Attendance saved = attendanceRepository.save(attendance);

        // 5. Audit Log
        AuditLogger.log("SYSTEM", "BIOMETRIC_PUNCH", employee.getEmployeeName(),
                "Device: " + dto.getDeviceId() + ", Punch: " + punchType + ", Time: " + time);

        // 6. SSE real-time broadcast
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
