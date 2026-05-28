package com.nexushr.security;

import com.nexushr.entity.Role;
import com.nexushr.repository.UserRepository;
import com.nexushr.repository.PayrollRepository;
import com.nexushr.repository.LeaveRequestRepository;
import com.nexushr.repository.PerformanceRepository;
import com.nexushr.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/*
 * Security Helper to evaluate owner permissions in SpEL annotations.
 */
@Component("securityHelper")
@RequiredArgsConstructor
public class SecurityHelper {

    private final UserRepository userRepository;
    private final PayrollRepository payrollRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PerformanceRepository performanceRepository;
    private final NotificationRepository notificationRepository;

    public boolean isOwner(Long employeeId) {
        if (employeeId == null) {
            return false;
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.equals("anonymousUser")) {
            return false;
        }

        return userRepository.findByEmail(email)
                .map(user -> {
                    // ADMIN and HR have access to everything
                    if (user.getRole() == Role.ADMIN || user.getRole() == Role.HR) {
                        return true;
                    }
                    // Regular employee can only access their own record
                    return user.getEmployee() != null && user.getEmployee().getId().equals(employeeId);
                })
                .orElse(false);
    }

    public boolean isPayrollOwner(Long payrollId) {
        if (payrollId == null) {
            return false;
        }
        return payrollRepository.findById(payrollId)
                .map(payroll -> isOwner(payroll.getEmployee().getId()))
                .orElse(false);
    }

    public boolean isLeaveOwner(Long leaveId) {
        if (leaveId == null) {
            return false;
        }
        return leaveRequestRepository.findById(leaveId)
                .map(leave -> isOwner(leave.getEmployee().getId()))
                .orElse(false);
    }

    public boolean isPerformanceOwner(Long performanceId) {
        if (performanceId == null) {
            return false;
        }
        return performanceRepository.findById(performanceId)
                .map(perf -> isOwner(perf.getEmployee().getId()))
                .orElse(false);
    }

    public boolean isNotificationOwner(Long notificationId) {
        if (notificationId == null) {
            return false;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.equals("anonymousUser")) {
            return false;
        }
        return notificationRepository.findById(notificationId)
                .map(notif -> notif.getUserEmail().equals(email))
                .orElse(false);
    }
}
