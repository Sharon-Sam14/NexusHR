package com.nexushr.service.impl;

import com.nexushr.dto.DashboardStatsDTO;
import com.nexushr.entity.*;
import com.nexushr.repository.*;
import com.nexushr.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DashboardServiceImpl implements DashboardService {

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
        long unread = notificationRepository.countByUserEmailAndRead(userEmail, false);

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
