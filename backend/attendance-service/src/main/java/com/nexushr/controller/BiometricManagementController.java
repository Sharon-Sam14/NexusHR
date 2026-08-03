package com.nexushr.controller;

import com.nexushr.entity.*;
import com.nexushr.repository.*;
import com.nexushr.service.BiometricDeviceService;
import com.nexushr.service.BiometricAttendanceService;
import com.nexushr.dto.BiometricAttendanceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/biometric")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BiometricManagementController {

    private final BiometricDeviceRepository biometricDeviceRepository;
    private final EmployeeBiometricRepository employeeBiometricRepository;
    private final AttendanceBiometricRepository attendanceBiometricRepository;
    private final DeviceSyncLogRepository deviceSyncLogRepository;
    private final AttendanceCorrectionRepository attendanceCorrectionRepository;
    private final ShiftConfigurationRepository shiftConfigurationRepository;
    private final HolidayCalendarRepository holidayCalendarRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    private final BiometricDeviceService biometricDeviceService;
    private final BiometricAttendanceService biometricAttendanceService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // ==========================================
    // 1. DEVICE MANAGEMENT (ADMIN / HR ONLY)
    // ==========================================

    @GetMapping("/devices")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<BiometricDevice>> getAllDevices() {
        return ResponseEntity.ok(biometricDeviceRepository.findAll());
    }

    @PostMapping("/devices")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<BiometricDevice> registerDevice(@RequestBody BiometricDevice device) {
        log.info("[API] Registering biometric device {}", device.getDeviceId());
        if (device.getDeviceId() == null || device.getDeviceId().isBlank()) {
            throw new IllegalArgumentException("Device ID is required");
        }
        if (biometricDeviceRepository.findByDeviceId(device.getDeviceId()).isPresent()) {
            throw new RuntimeException("Device ID already registered: " + device.getDeviceId());
        }
        BiometricDevice saved = biometricDeviceRepository.save(device);
        try {
            biometricDeviceService.connect(saved);
            biometricDeviceRepository.save(saved);
        } catch (Exception e) {
            log.error("Failed to connect to device during registration", e);
        }
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/devices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<BiometricDevice> updateDevice(@PathVariable Long id, @RequestBody BiometricDevice updated) {
        BiometricDevice existing = biometricDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        existing.setDeviceName(updated.getDeviceName());
        existing.setIpAddress(updated.getIpAddress());
        existing.setPort(updated.getPort());
        existing.setLocation(updated.getLocation());
        existing.setSerialNumber(updated.getSerialNumber());
        existing.setStatus(updated.getStatus());
        return ResponseEntity.ok(biometricDeviceRepository.save(existing));
    }

    @DeleteMapping("/devices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        BiometricDevice device = biometricDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        biometricDeviceService.disconnect(device);
        biometricDeviceRepository.delete(device);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/devices/{id}/test-connection")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<BiometricDevice> testConnection(@PathVariable Long id) {
        BiometricDevice device = biometricDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        biometricDeviceService.testConnection(device);
        return ResponseEntity.ok(biometricDeviceRepository.save(device));
    }

    @PostMapping("/devices/{id}/sync")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceBiometric>> triggerDeviceSync(@PathVariable Long id) {
        BiometricDevice device = biometricDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (!"CONNECTED".equals(device.getConnectionStatus())) {
            biometricDeviceService.connect(device);
        }

        List<AttendanceBiometric> fetched = biometricDeviceService.fetchAttendanceLogs(device);
        if (!fetched.isEmpty()) {
            List<AttendanceBiometric> savedRaw = attendanceBiometricRepository.saveAll(fetched);
            for (AttendanceBiometric raw : savedRaw) {
                try {
                    BiometricAttendanceDTO dto = BiometricAttendanceDTO.builder()
                            .employeeId(raw.getEmployee().getId())
                            .deviceId(raw.getDeviceId())
                            .timestamp(raw.getPunchTime())
                            .type(raw.getPunchType())
                            .build();

                    biometricAttendanceService.processBiometricPunch(dto);
                    raw.setProcessed(true);
                    attendanceBiometricRepository.save(raw);
                } catch (Exception e) {
                    log.error("Failed manual sync process for employee id={}", raw.getEmployee().getId(), e);
                }
            }
            device.setLastSyncTime(LocalDateTime.now());
            biometricDeviceRepository.save(device);
            deviceSyncLogRepository.save(DeviceSyncLog.builder()
                    .deviceId(device.getDeviceId())
                    .syncTime(LocalDateTime.now())
                    .recordsSynced(savedRaw.size())
                    .status("SUCCESS")
                    .build());
        }
        return ResponseEntity.ok(fetched);
    }

    // ==========================================
    // 2. BIOMETRIC ENROLLMENTS
    // ==========================================

    @GetMapping("/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeBiometric>> getAllEnrollments() {
        return ResponseEntity.ok(employeeBiometricRepository.findAll());
    }

    @GetMapping("/enroll/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<EmployeeBiometric>> getEnrollmentsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(employeeBiometricRepository.findByEmployeeId(employeeId));
    }

    @PostMapping("/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeBiometric> enrollEmployee(@RequestBody EmployeeBiometric enrollment) {
        if (enrollment.getEmployee() == null || enrollment.getEmployee().getId() == null) {
            throw new IllegalArgumentException("Employee reference is required");
        }
        Employee employee = employeeRepository.findById(enrollment.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        enrollment.setEmployee(employee);
        enrollment.setLastSyncedAt(LocalDateTime.now());
        EmployeeBiometric saved = employeeBiometricRepository.save(enrollment);

        // Sync template to active devices
        List<BiometricDevice> devices = biometricDeviceRepository.findAll();
        for (BiometricDevice dev : devices) {
            if ("CONNECTED".equals(dev.getConnectionStatus())) {
                biometricDeviceService.registerEmployee(dev, employee, enrollment.getBiometricType(), enrollment.getBiometricTemplate());
            }
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/enroll/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        EmployeeBiometric enrollment = employeeBiometricRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        List<BiometricDevice> devices = biometricDeviceRepository.findAll();
        for (BiometricDevice dev : devices) {
            if ("CONNECTED".equals(dev.getConnectionStatus())) {
                biometricDeviceService.deleteEmployee(dev, enrollment.getEmployee());
            }
        }
        employeeBiometricRepository.delete(enrollment);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/enroll/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeBiometric> toggleEnrollment(@PathVariable Long id) {
        EmployeeBiometric eb = employeeBiometricRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        eb.setEnabled(!eb.isEnabled());
        return ResponseEntity.ok(employeeBiometricRepository.save(eb));
    }

    // ==========================================
    // 3. SHIFT CONFIGURATIONS
    // ==========================================

    @GetMapping("/shifts")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<ShiftConfiguration>> getAllShifts() {
        return ResponseEntity.ok(shiftConfigurationRepository.findAll());
    }

    @PostMapping("/shifts")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ShiftConfiguration> saveShift(@RequestBody ShiftConfiguration shift) {
        Optional<ShiftConfiguration> existing = shiftConfigurationRepository.findByShiftName(shift.getShiftName());
        if (existing.isPresent()) {
            ShiftConfiguration exist = existing.get();
            exist.setStartTime(shift.getStartTime());
            exist.setEndTime(shift.getEndTime());
            exist.setHalfDayThresholdHours(shift.getHalfDayThresholdHours());
            exist.setFullDayHours(shift.getFullDayHours());
            exist.setGraceTimeMinutes(shift.getGraceTimeMinutes());
            exist.setNightShift(shift.isNightShift());
            return ResponseEntity.ok(shiftConfigurationRepository.save(exist));
        }
        return ResponseEntity.ok(shiftConfigurationRepository.save(shift));
    }

    @DeleteMapping("/shifts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        shiftConfigurationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // 4. HOLIDAY CALENDAR
    // ==========================================

    @GetMapping("/holidays")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<HolidayCalendar>> getAllHolidays() {
        return ResponseEntity.ok(holidayCalendarRepository.findAll());
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<HolidayCalendar> saveHoliday(@RequestBody HolidayCalendar holiday) {
        Optional<HolidayCalendar> existing = holidayCalendarRepository.findByHolidayDate(holiday.getHolidayDate());
        if (existing.isPresent()) {
            HolidayCalendar exist = existing.get();
            exist.setHolidayName(holiday.getHolidayName());
            exist.setNationalHoliday(holiday.isNationalHoliday());
            return ResponseEntity.ok(holidayCalendarRepository.save(exist));
        }
        return ResponseEntity.ok(holidayCalendarRepository.save(holiday));
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayCalendarRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // 5. ATTENDANCE CORRECTIONS
    // ==========================================

    @GetMapping("/corrections")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceCorrection>> getAllCorrections() {
        return ResponseEntity.ok(attendanceCorrectionRepository.findAll());
    }

    @GetMapping("/corrections/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<AttendanceCorrection>> getCorrectionsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceCorrectionRepository.findByEmployeeId(employeeId));
    }

    @PostMapping("/corrections")
    @PreAuthorize("@securityHelper.isOwner(#correction.employee.id)")
    public ResponseEntity<AttendanceCorrection> applyCorrection(@RequestBody AttendanceCorrection correction) {
        if (correction.getEmployee() == null || correction.getEmployee().getId() == null) {
            throw new IllegalArgumentException("Employee reference is required");
        }
        Employee employee = employeeRepository.findById(correction.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        correction.setEmployee(employee);
        correction.setStatus("PENDING");
        correction.setRequestedBy(getCurrentUserEmail());
        correction.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(attendanceCorrectionRepository.save(correction));
    }

    @PostMapping("/corrections/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AttendanceCorrection> approveCorrection(@PathVariable Long id) {
        AttendanceCorrection correction = attendanceCorrectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Correction request not found"));

        if (!"PENDING".equals(correction.getStatus())) {
            throw new RuntimeException("Correction request has already been processed");
        }

        // Apply correction to standard attendance
        LocalDate date = correction.getAttendanceDate();
        Employee employee = correction.getEmployee();

        Attendance attendance = attendanceRepository.findFirstByEmployeeIdAndDate(employee.getId(), date)
                .orElse(Attendance.builder()
                        .employee(employee)
                        .date(date)
                        .build());

        attendance.setCheckIn(correction.getCorrectedCheckIn());
        attendance.setCheckOut(correction.getCorrectedCheckOut());

        // Recalculate work hours
        long minutes = ChronoUnit.MINUTES.between(correction.getCorrectedCheckIn(), correction.getCorrectedCheckOut());
        double hours = Math.round((minutes / 60.0) * 100.0) / 100.0;
        attendance.setWorkHours(hours);

        // Resolve status
        if (hours < 4.0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        } else {
            attendance.setStatus(AttendanceStatus.PRESENT);
        }

        attendance.setRemarks("Manual correction approved (" + getCurrentUserEmail() + "): " + correction.getReason());
        attendanceRepository.save(attendance);

        correction.setStatus("APPROVED");
        correction.setApprovedBy(getCurrentUserEmail());
        return ResponseEntity.ok(attendanceCorrectionRepository.save(correction));
    }

    @PostMapping("/corrections/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AttendanceCorrection> rejectCorrection(@PathVariable Long id) {
        AttendanceCorrection correction = attendanceCorrectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Correction request not found"));

        if (!"PENDING".equals(correction.getStatus())) {
            throw new RuntimeException("Correction request has already been processed");
        }

        correction.setStatus("REJECTED");
        correction.setApprovedBy(getCurrentUserEmail());
        return ResponseEntity.ok(attendanceCorrectionRepository.save(correction));
    }
}
