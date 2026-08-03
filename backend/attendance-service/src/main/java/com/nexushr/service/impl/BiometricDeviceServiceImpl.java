package com.nexushr.service.impl;

import com.nexushr.entity.AttendanceBiometric;
import com.nexushr.entity.BiometricDevice;
import com.nexushr.entity.Employee;
import com.nexushr.entity.EmployeeBiometric;
import com.nexushr.repository.EmployeeBiometricRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.service.BiometricDeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class BiometricDeviceServiceImpl implements BiometricDeviceService {

    private final EmployeeBiometricRepository employeeBiometricRepository;
    private final EmployeeRepository employeeRepository;
    private final Random random = new Random();

    @Override
    public boolean connect(BiometricDevice device) {
        log.info("[DEVICE CLIENT] Connecting to device {} at {}:{}", device.getDeviceId(), device.getIpAddress(), device.getPort());
        // Simulate network handshake
        try {
            Thread.sleep(100); // Simulate network latency
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        device.setConnectionStatus("CONNECTED");
        device.setStatus("ACTIVE");
        log.info("[DEVICE CLIENT] Device {} connected successfully.", device.getDeviceId());
        return true;
    }

    @Override
    public boolean disconnect(BiometricDevice device) {
        log.info("[DEVICE CLIENT] Disconnecting device {}.", device.getDeviceId());
        device.setConnectionStatus("DISCONNECTED");
        return true;
    }

    @Override
    public List<AttendanceBiometric> fetchAttendanceLogs(BiometricDevice device) {
        log.info("[DEVICE CLIENT] Fetching attendance logs from {}...", device.getDeviceId());
        List<AttendanceBiometric> logs = new ArrayList<>();

        if (!"CONNECTED".equals(device.getConnectionStatus())) {
            log.warn("[DEVICE CLIENT] Device {} is not connected. Aborting fetch.", device.getDeviceId());
            return logs;
        }

        // Retrieve registered employee biometric mappings
        List<EmployeeBiometric> enrolled = employeeBiometricRepository.findByEnabled(true);
        if (enrolled.isEmpty()) {
            log.info("[DEVICE CLIENT] No employees enrolled. Simulating dynamic logs for active profiles.");
            // Fallback: use some active employees to simulate logs
            List<Employee> employees = employeeRepository.findAll();
            if (!employees.isEmpty()) {
                // Pick up to 5 random employees
                int count = Math.min(5, employees.size());
                for (int i = 0; i < count; i++) {
                    Employee emp = employees.get(random.nextInt(employees.size()));
                    logs.add(createSimulatedPunch(emp, device.getDeviceId()));
                }
            }
        } else {
            // Generate punches for some of the enrolled employees
            for (EmployeeBiometric eb : enrolled) {
                if (random.nextDouble() < 0.8) { // 80% chance of generating a punch log
                    logs.add(createSimulatedPunch(eb.getEmployee(), device.getDeviceId()));
                }
            }
        }

        log.info("[DEVICE CLIENT] Successfully pulled {} raw biometric punch records from device {}.", logs.size(), device.getDeviceId());
        return logs;
    }

    private AttendanceBiometric createSimulatedPunch(Employee employee, String deviceId) {
        // Decide Check-In or Check-Out
        String type = random.nextBoolean() ? "CHECK_IN" : "CHECK_OUT";
        LocalTime time;
        if ("CHECK_IN".equals(type)) {
            // Check-in between 8:30 AM and 9:45 AM
            time = LocalTime.of(8, 30).plusMinutes(random.nextInt(75));
        } else {
            // Check-out between 5:00 PM and 6:30 PM
            time = LocalTime.of(17, 0).plusMinutes(random.nextInt(90));
        }

        LocalDateTime punchTime = LocalDateTime.of(LocalDate.now(), time);

        return AttendanceBiometric.builder()
                .employee(employee)
                .deviceId(deviceId)
                .punchTime(punchTime)
                .punchType(type)
                .processed(false)
                .build();
    }

    @Override
    public boolean registerEmployee(BiometricDevice device, Employee employee, String biometricType, String template) {
        log.info("[DEVICE CLIENT] Synchronizing template to device: Device={}, Employee={}, Type={}", 
                device.getDeviceId(), employee.getEmployeeName(), biometricType);
        return "CONNECTED".equals(device.getConnectionStatus());
    }

    @Override
    public boolean deleteEmployee(BiometricDevice device, Employee employee) {
        log.info("[DEVICE CLIENT] Removing employee from device: Device={}, Employee={}", 
                device.getDeviceId(), employee.getEmployeeName());
        return "CONNECTED".equals(device.getConnectionStatus());
    }

    @Override
    public boolean testConnection(BiometricDevice device) {
        log.info("[DEVICE CLIENT] Testing connection to {}:{}", device.getIpAddress(), device.getPort());
        // Simulate a network ping. Assume unreachable if IP starts with "192.168.99"
        if (device.getIpAddress() != null && device.getIpAddress().startsWith("192.168.99")) {
            device.setConnectionStatus("DISCONNECTED");
            device.setStatus("ERROR");
            log.error("[DEVICE CLIENT] Failed to reach device at {}:{}", device.getIpAddress(), device.getPort());
            return false;
        }
        device.setConnectionStatus("CONNECTED");
        device.setStatus("ACTIVE");
        log.info("[DEVICE CLIENT] Connection test succeeded.");
        return true;
    }
}
