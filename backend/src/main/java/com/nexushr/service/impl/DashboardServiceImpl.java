package com.nexushr.service.impl;

import com.nexushr.dto.DashboardStatsDTO;
import com.nexushr.entity.*;
import com.nexushr.repository.*;
import com.nexushr.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final RecruitmentRepository recruitmentRepository;
    private final DepartmentRepository departmentRepository;
    private final PerformanceRepository performanceRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public DashboardStatsDTO getStats(String userEmail) {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        long unread = notificationRepository.countByUserEmailAndRead(userEmail, false);

        if (user.getRole() == Role.EMPLOYEE && user.getEmployee() != null) {
            Long employeeId = user.getEmployee().getId();

            Optional<Attendance> attendanceToday = attendanceRepository.findFirstByEmployeeIdAndDate(employeeId, today);
            long presentToday = attendanceToday.map(a -> 
                a.getStatus() == AttendanceStatus.PRESENT || 
                a.getStatus() == AttendanceStatus.LATE || 
                a.getStatus() == AttendanceStatus.HALF_DAY ? 1L : 0L
            ).orElse(0L);
            long absentToday = presentToday == 1L ? 0L : 1L;

            long pendingLeaves = leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, LeaveStatus.PENDING).size();
            long approvedLeavesToday = leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, LeaveStatus.APPROVED).size();

            List<Payroll> currentPayroll = payrollRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
            Double totalPayroll = currentPayroll.stream().mapToDouble(Payroll::getNetSalary).sum();

            List<Performance> reviews = performanceRepository.findByEmployeeId(employeeId);
            Double avgRating = reviews.stream()
                    .mapToDouble(Performance::getOverallRating)
                    .average()
                    .orElse(0.0);

            return DashboardStatsDTO.builder()
                    .totalEmployees(1L)
                    .activeEmployees(1L)
                    .presentToday(presentToday)
                    .absentToday(absentToday)
                    .pendingLeaves(pendingLeaves)
                    .approvedLeavesToday(approvedLeavesToday)
                    .totalPayrollThisMonth(totalPayroll)
                    .openJobPositions(0L)
                    .totalDepartments(1L)
                    .avgPerformanceRating(avgRating)
                    .unreadNotifications(unread)
                    .build();
        } else {
            // ADMIN / HR Stats (Global)
            long totalEmployees = employeeRepository.count();
            long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
            long presentToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
            long absentToday = activeEmployees - presentToday;
            long pendingLeaves = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
            long approvedLeavesToday = leaveRequestRepository.countByStatus(LeaveStatus.APPROVED);
            Double totalPayroll = payrollRepository.sumNetSalaryByMonthAndYear(month, year);
            long openJobs = recruitmentRepository.countByStatus(RecruitmentStatus.OPEN);
            long totalDepts = departmentRepository.count();
            Double avgRating = performanceRepository.findAverageOverallRating();

            return DashboardStatsDTO.builder()
                    .totalEmployees(totalEmployees)
                    .activeEmployees(activeEmployees)
                    .presentToday(presentToday)
                    .absentToday(Math.max(absentToday, 0))
                    .pendingLeaves(pendingLeaves)
                    .approvedLeavesToday(approvedLeavesToday)
                    .totalPayrollThisMonth(totalPayroll != null ? totalPayroll : 0.0)
                    .openJobPositions(openJobs)
                    .totalDepartments(totalDepts)
                    .avgPerformanceRating(avgRating != null ? avgRating : 0.0)
                    .unreadNotifications(unread)
                    .build();
        }
    }
}
