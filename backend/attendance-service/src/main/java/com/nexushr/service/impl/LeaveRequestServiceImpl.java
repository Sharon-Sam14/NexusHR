package com.nexushr.service.impl;

import com.nexushr.dto.LeaveRequestDTO;
import com.nexushr.dto.NotificationDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.LeaveRequest;
import com.nexushr.entity.LeaveStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveRequestRepository;
import com.nexushr.service.LeaveRequestService;
import com.nexushr.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import com.nexushr.util.AuditLogger;
import org.springframework.transaction.annotation.Transactional;

/*
 * Leave Request Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    @Override
    public LeaveRequestDTO applyLeave(LeaveRequestDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        int totalDays = (int) ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        if (employee.getLeaveBalance() < totalDays) {
            throw new RuntimeException("Insufficient leave balance. Remaining: " + employee.getLeaveBalance() + " days, Requested: " + totalDays + " days.");
        }

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .totalDays(totalDays)
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .appliedDate(LocalDate.now())
                .build();

        LeaveRequestDTO saved = toDTO(leaveRequestRepository.save(request));

        // Notify HR and Admin of new leave application
        String title = "New Leave Application";
        String message = employee.getEmployeeName() + " has requested " + dto.getLeaveType() +
                " leave (" + totalDays + " days: " + dto.getStartDate() + " to " + dto.getEndDate() + ").";
        sendNotification("hr@nexushr.com", title, message, "LEAVE");
        sendNotification("admin@nexushr.com", title, message, "LEAVE");

        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "LEAVE_REQUESTED", employee.getEmployeeName(), "Type: " + request.getLeaveType() + ", Days: " + totalDays);

        return saved;
    }

    @Override
    public LeaveRequestDTO approveLeave(Long id, String approvedBy, String remarks) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (request.getStatus() != LeaveStatus.PENDING && !isAdmin) {
            throw new RuntimeException("Only Admin can override existing leave decisions.");
        }

        if (request.getStatus() == LeaveStatus.APPROVED) {
            return toDTO(request);
        }

        Employee employee = request.getEmployee();
        int totalDays = request.getTotalDays();
        if (employee.getLeaveBalance() < totalDays) {
            throw new RuntimeException("Insufficient leave balance. Remaining: " + employee.getLeaveBalance() + " days, Approved: " + totalDays + " days.");
        }

        employee.setLeaveBalance(employee.getLeaveBalance() - totalDays);
        employeeRepository.save(employee);

        request.setStatus(LeaveStatus.APPROVED);
        request.setApprovedBy(approvedBy);
        request.setApprovalRemarks(remarks);

        LeaveRequestDTO saved = toDTO(leaveRequestRepository.save(request));

        // Notify employee of approval
        String title = "Leave Approved";
        String message = "Your " + request.getLeaveType() + " leave request for " + totalDays +
                " days has been APPROVED by " + approvedBy + ".";
        if (remarks != null && !remarks.isBlank()) {
            message += " Remarks: " + remarks;
        }
        sendNotification(employee.getEmail(), title, message, "LEAVE");

        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "LEAVE_APPROVED", employee.getEmployeeName(), "Approved by: " + approvedBy + ", Remarks: " + remarks);

        return saved;
    }

    @Override
    public LeaveRequestDTO rejectLeave(Long id, String approvedBy, String remarks) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (request.getStatus() != LeaveStatus.PENDING && !isAdmin) {
            throw new RuntimeException("Only Admin can override existing leave decisions.");
        }

        if (request.getStatus() == LeaveStatus.APPROVED) {
            Employee employee = request.getEmployee();
            employee.setLeaveBalance(employee.getLeaveBalance() + request.getTotalDays());
            employeeRepository.save(employee);
        }

        request.setStatus(LeaveStatus.REJECTED);
        request.setApprovedBy(approvedBy);
        request.setApprovalRemarks(remarks);

        LeaveRequestDTO saved = toDTO(leaveRequestRepository.save(request));

        // Notify employee of rejection
        String title = "Leave Rejected";
        String message = "Your " + request.getLeaveType() + " leave request has been REJECTED by " + approvedBy + ".";
        if (remarks != null && !remarks.isBlank()) {
            message += " Remarks: " + remarks;
        }
        sendNotification(request.getEmployee().getEmail(), title, message, "LEAVE");

        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "LEAVE_REJECTED", request.getEmployee().getEmployeeName(), "Rejected by: " + approvedBy + ", Remarks: " + remarks);

        return saved;
    }

    @Override
    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDTO> getLeaveRequestsByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDTO> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public void cancelLeave(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        LeaveStatus oldStatus = request.getStatus();
        if (oldStatus == LeaveStatus.APPROVED) {
            Employee employee = request.getEmployee();
            employee.setLeaveBalance(employee.getLeaveBalance() + request.getTotalDays());
            employeeRepository.save(employee);
        }
        request.setStatus(LeaveStatus.CANCELLED);
        leaveRequestRepository.save(request);

        // Notify HR and Admin of cancellation
        if (oldStatus == LeaveStatus.PENDING || oldStatus == LeaveStatus.APPROVED) {
            String title = "Leave Request Cancelled";
            String message = request.getEmployee().getEmployeeName() + " has cancelled their " +
                    request.getLeaveType() + " leave request (originally " + request.getTotalDays() + " days).";
            sendNotification("hr@nexushr.com", title, message, "LEAVE");
            sendNotification("admin@nexushr.com", title, message, "LEAVE");
        }
    }

    private void sendNotification(String email, String title, String message, String type) {
        try {
            NotificationDTO notification = NotificationDTO.builder()
                    .userEmail(email)
                    .title(title)
                    .message(message)
                    .type(type)
                    .actionUrl("/leave")
                    .build();
            notificationService.createNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send leave notification: " + e.getMessage());
        }
    }

    private LeaveRequestDTO toDTO(LeaveRequest r) {
        return LeaveRequestDTO.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getEmployeeName())
                .department(r.getEmployee().getDepartment())
                .leaveType(r.getLeaveType())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .totalDays(r.getTotalDays())
                .reason(r.getReason())
                .status(r.getStatus())
                .approvedBy(r.getApprovedBy())
                .approvalRemarks(r.getApprovalRemarks())
                .appliedDate(r.getAppliedDate())
                .build();
    }

}