package com.nexushr.controller;

import com.nexushr.dto.AttendanceDTO;
import com.nexushr.dto.BiometricAttendanceDTO;
import com.nexushr.entity.Attendance;
import com.nexushr.entity.Employee;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.service.BiometricAttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/attendance/biometric")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class BiometricAttendanceController {

    private final BiometricAttendanceService biometricAttendanceService;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final Random random = new Random();

    @PostMapping
    public ResponseEntity<AttendanceDTO> processPunch(@RequestBody BiometricAttendanceDTO dto) {
        if (dto.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee ID is required");
        }
        if (dto.getType() == null || dto.getType().isBlank()) {
            throw new IllegalArgumentException("Punch type (CHECK_IN or CHECK_OUT) is required");
        }
        if (dto.getTimestamp() == null) {
            dto.setTimestamp(LocalDateTime.now());
        }
        if (dto.getDeviceId() == null || dto.getDeviceId().isBlank()) {
            dto.setDeviceId("DEVICE_API_DEFAULT");
        }

        return ResponseEntity.ok(biometricAttendanceService.processBiometricPunch(dto));
    }

    @PostMapping("/simulate")
    public ResponseEntity<AttendanceDTO> simulatePunch(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String type) {

        log.info("[SIMULATOR] Triggering simulated biometric punch...");

        // 1. Resolve employee
        Employee employee;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        } else {
            List<Employee> activeEmployees = employeeRepository.findAll();
            if (activeEmployees.isEmpty()) {
                throw new RuntimeException("No employees available to simulate punches.");
            }
            employee = activeEmployees.get(random.nextInt(activeEmployees.size()));
        }

        // 2. Resolve punch type (CHECK_IN or CHECK_OUT)
        String resolvedType = type;
        if (resolvedType == null || resolvedType.isBlank()) {
            LocalDate today = LocalDate.now();
            List<Attendance> attendanceToday = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today);
            if (attendanceToday.isEmpty() || attendanceToday.get(0).getCheckIn() == null) {
                resolvedType = "CHECK_IN";
            } else {
                resolvedType = "CHECK_OUT";
            }
        }

        BiometricAttendanceDTO dto = BiometricAttendanceDTO.builder()
                .employeeId(employee.getId())
                .deviceId("SIMULATOR_DEV_01")
                .timestamp(LocalDateTime.now())
                .type(resolvedType)
                .build();

        log.info("[SIMULATOR] Dispatched punch: Employee={}, Type={}", employee.getEmployeeName(), resolvedType);
        return ResponseEntity.ok(biometricAttendanceService.processBiometricPunch(dto));
    }
}
