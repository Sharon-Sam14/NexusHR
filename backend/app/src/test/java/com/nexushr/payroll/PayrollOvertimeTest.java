package com.nexushr.payroll;

import com.nexushr.dto.PayrollDTO;
import com.nexushr.entity.*;
import com.nexushr.repository.*;
import com.nexushr.service.PayrollService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@SuppressWarnings("null")
public class PayrollOvertimeTest {

    @Autowired
    private PayrollService payrollService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RecruitmentRepository recruitmentRepository;

    @Autowired
    private EmployeeDocumentRepository employeeDocumentRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private Employee testEmployee;

    @BeforeEach
    public void setup() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
        goalRepository.deleteAll();
        performanceRepository.deleteAll();
        payrollRepository.deleteAll();
        leaveRequestRepository.deleteAll();
        attendanceRepository.deleteAll();
        notificationRepository.deleteAll();
        recruitmentRepository.deleteAll();
        employeeDocumentRepository.deleteAll();
        employeeRepository.deleteAll();
        departmentRepository.deleteAll();

        testEmployee = employeeRepository.save(Employee.builder()
                .employeeName("Test Worker")
                .email("test.worker@nexushr.com")
                .phone("9999999999")
                .department("Engineering")
                .designation("Developer")
                .salary(90000.0) // Hourly rate: 90000 / (20 * 9.0) = 500
                .joiningDate(LocalDate.now().minusMonths(6))
                .status(EmployeeStatus.ACTIVE)
                .gender("Male")
                .build());
    }

    @Test
    public void testOvertimeCalculationAndPayout() {
        // 1. Log attendance with no overtime
        attendanceRepository.save(Attendance.builder()
                .employee(testEmployee)
                .date(LocalDate.of(2026, 5, 1))
                .checkIn(LocalTime.of(9, 0))
                .checkOut(LocalTime.of(18, 0))
                .workHours(9.0) // 9.0 hours = Standard day (0 overtime)
                .status(AttendanceStatus.PRESENT)
                .remarks("Standard shift")
                .build());

        // 2. Log attendance with 3 hours of overtime (12.0 hours total)
        attendanceRepository.save(Attendance.builder()
                .employee(testEmployee)
                .date(LocalDate.of(2026, 5, 4))
                .checkIn(LocalTime.of(9, 0))
                .checkOut(LocalTime.of(21, 0))
                .workHours(12.0) // 3.0 overtime hours
                .status(AttendanceStatus.PRESENT)
                .remarks("Overtime shift")
                .build());

        // 3. Log attendance with 4 hours of overtime (13.0 hours total)
        attendanceRepository.save(Attendance.builder()
                .employee(testEmployee)
                .date(LocalDate.of(2026, 5, 5))
                .checkIn(LocalTime.of(9, 0))
                .checkOut(LocalTime.of(22, 0))
                .workHours(13.0) // 4.0 overtime hours
                .status(AttendanceStatus.PRESENT)
                .remarks("Extra overtime shift")
                .build());

        // Total expected overtime hours = 3.0 + 4.0 = 7.0 hours

        // 4. Generate payroll for May 2026
        PayrollDTO payrollRequest = PayrollDTO.builder()
                .employeeId(testEmployee.getId())
                .month(5)
                .year(2026)
                .basicSalary(90000.0)
                .bonus(0.0)
                .deductions(0.0)
                .workingDays(20) // Hourly rate = 90000 / (20 * 9.0) = 500.0
                .daysPresent(20)
                .remarks("Monthly salary payout test")
                .build();

        PayrollDTO payrollResult = payrollService.generatePayroll(payrollRequest);

        // 5. Assertions
        assertNotNull(payrollResult);
        assertEquals(7.0, payrollResult.getOvertimeHours(), 0.01);

        // Hourly rate = 90000 / 180 = 500
        // Overtime rate = 500 * 1.5 = 750
        // Overtime pay = 7.0 * 750 = 5250
        assertEquals(5250.0, payrollResult.getOvertimePay(), 0.01);

        // Net salary calculation: basic (90000) + overtime (5250) - tax
        // Tax rate resolves via resolving logic: 90000 < 100,000 -> 18% -> 90000 * 0.18 = 16200
        // Net salary = 90000 + 5250 - 16200 = 79050.0
        assertEquals(79050.0, payrollResult.getNetSalary(), 0.01);
    }
}
