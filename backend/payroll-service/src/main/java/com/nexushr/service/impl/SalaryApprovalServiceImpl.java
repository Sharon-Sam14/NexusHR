package com.nexushr.service.impl;

import com.nexushr.dto.SalaryApprovalRequestDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.SalaryApprovalRequest;
import com.nexushr.entity.SalaryApprovalStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.SalaryApprovalRequestRepository;
import com.nexushr.repository.PayrollRepository;
import com.nexushr.payroll.PayrollCalculator;
import com.nexushr.entity.Payroll;
import com.nexushr.entity.PayrollStatus;
import com.nexushr.service.SalaryApprovalService;
import com.nexushr.notification.NotificationDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.nexushr.util.AuditLogger;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SalaryApprovalServiceImpl implements SalaryApprovalService {

    private final SalaryApprovalRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollRepository payrollRepository;
    private final PayrollCalculator payrollCalculator;
    private final NotificationDispatcher notificationDispatcher;

    @Override
    public SalaryApprovalRequestDTO createRequest(SalaryApprovalRequestDTO dto, String hrEmail) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        log.info("[AUDIT] HR {} is submitting salary revision request for employee {} (ID: {}) from {} to {}",
                hrEmail, employee.getEmployeeName(), employee.getId(), employee.getSalary(), dto.getProposedSalary());

        SalaryApprovalRequest request = SalaryApprovalRequest.builder()
                .employee(employee)
                .previousSalary(employee.getSalary())
                .proposedSalary(dto.getProposedSalary())
                .reason(dto.getReason())
                .requestedBy(hrEmail)
                .requestedDate(LocalDate.now())
                .status(SalaryApprovalStatus.PENDING)
                .build();

        SalaryApprovalRequest saved = requestRepository.save(request);

        // Notify Admins
        try {
            notificationDispatcher.dispatch(new NotificationDispatcher.DispatchPayload(
                    "admin@nexushr.com",
                    "Salary Revision Awaiting Approval",
                    "HR has submitted a salary revision for " + employee.getEmployeeName() + " from ₹" + String.format("%,.2f", saved.getPreviousSalary()) + " to ₹" + String.format("%,.2f", saved.getProposedSalary()) + " awaiting approval.",
                    "PAYROLL",
                    "/payroll",
                    null
            ));
        } catch (Exception e) {
            log.error("Failed to send Admin notification: {}", e.getMessage());
        }

        return toDTO(saved);
    }

    @Override
    public List<SalaryApprovalRequestDTO> getPendingRequests() {
        return requestRepository.findByStatusOrderByRequestedDateDesc(SalaryApprovalStatus.PENDING).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SalaryApprovalRequestDTO> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SalaryApprovalRequestDTO approveRequest(Long id, String adminEmail) {
        SalaryApprovalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary approval request not found"));

        if (request.getStatus() != SalaryApprovalStatus.PENDING) {
            throw new RuntimeException("Request is already processed: " + request.getStatus());
        }

        Employee employee = request.getEmployee();
        Double oldSalary = employee.getSalary();
        Double newSalary = request.getProposedSalary();

        log.info("[AUDIT] Admin {} APPROVED salary revision for employee {} (ID: {}) from {} to {}",
                adminEmail, employee.getEmployeeName(), employee.getId(), oldSalary, newSalary);

        // 1. Update Employee's actual salary
        employee.setSalary(newSalary);
        employeeRepository.save(employee);

        // 1.5 Update current month's active (non-paid) payroll
        try {
            int currentMonth = LocalDate.now().getMonthValue();
            int currentYear = LocalDate.now().getYear();
            List<Payroll> existingPayrolls = payrollRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), currentMonth, currentYear);
            if (existingPayrolls != null && !existingPayrolls.isEmpty()) {
                Payroll payroll = existingPayrolls.get(0);
                if (payroll.getStatus() != PayrollStatus.PAID) {
                    double hourlyRate = newSalary / ((payroll.getWorkingDays() != null ? payroll.getWorkingDays() : 22) * 9.0);
                    PayrollCalculator.PayrollResult result = payrollCalculator.calculate(
                            newSalary,
                            payroll.getBonus(),
                            payroll.getDeductions(),
                            payroll.getOvertimeHours(),
                            hourlyRate,
                            payroll.getAllowances(),
                            payroll.getReimbursements()
                    );
                    payroll.setBasicSalary(result.basicSalary());
                    payroll.setTax(result.taxAmount());
                    payroll.setOvertimePay(result.overtimePay());
                    payroll.setNetSalary(result.netSalary());
                    payroll.setRemarks(payroll.getRemarks() != null ? payroll.getRemarks() : ("Overtime calc: " + result.taxBracketLabel()));
                    payrollRepository.save(payroll);
                    log.info("Automatically recalculated current month's payroll for employee {} with revised salary", employee.getEmployeeName());
                }
            }
        } catch (Exception e) {
            log.error("Failed to automatically recalculate current month's payroll: {}", e.getMessage());
        }

        // 2. Set Request Status
        request.setStatus(SalaryApprovalStatus.APPROVED);
        request.setApprovedBy(adminEmail);
        request.setActionDate(LocalDate.now());
        SalaryApprovalRequest saved = requestRepository.save(request);

        // 3. Notify HR Requester
        try {
            notificationDispatcher.dispatch(new NotificationDispatcher.DispatchPayload(
                    request.getRequestedBy(),
                    "Salary Revision Approved",
                    "The salary revision for " + employee.getEmployeeName() + " from ₹" + String.format("%,.2f", oldSalary) + " to ₹" + String.format("%,.2f", newSalary) + " has been approved.",
                    "PAYROLL",
                    "/payroll",
                    null
            ));
        } catch (Exception e) {
            log.error("Failed to notify HR requester: {}", e.getMessage());
        }

        // 4. Notify Employee
        try {
            notificationDispatcher.dispatch(new NotificationDispatcher.DispatchPayload(
                    employee.getEmail(),
                    "Salary Revision Approved",
                    "Dear " + employee.getEmployeeName() + ", your salary has been revised to ₹" + String.format("%,.2f", newSalary) + ", effective immediately.",
                    "PAYROLL",
                    "/payroll",
                    employee.getPhone()
            ));
        } catch (Exception e) {
            log.error("Failed to notify Employee: {}", e.getMessage());
        }

        AuditLogger.log(adminEmail, "SALARY_REVISION_APPROVED", employee.getEmployeeName(), "Revised from ₹" + oldSalary + " to ₹" + newSalary);

        return toDTO(saved);
    }

    @Override
    public SalaryApprovalRequestDTO rejectRequest(Long id, String adminEmail) {
        SalaryApprovalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary approval request not found"));

        if (request.getStatus() != SalaryApprovalStatus.PENDING) {
            throw new RuntimeException("Request is already processed: " + request.getStatus());
        }

        Employee employee = request.getEmployee();

        log.info("[AUDIT] Admin {} REJECTED salary revision for employee {} (ID: {}) from {} to {}",
                adminEmail, employee.getEmployeeName(), employee.getId(), request.getPreviousSalary(), request.getProposedSalary());

        request.setStatus(SalaryApprovalStatus.REJECTED);
        request.setApprovedBy(adminEmail);
        request.setActionDate(LocalDate.now());
        SalaryApprovalRequest saved = requestRepository.save(request);

        // Notify HR Requester
        try {
            notificationDispatcher.dispatch(new NotificationDispatcher.DispatchPayload(
                    request.getRequestedBy(),
                    "Salary Revision Rejected",
                    "The salary revision for " + employee.getEmployeeName() + " from ₹" + String.format("%,.2f", request.getPreviousSalary()) + " to ₹" + String.format("%,.2f", request.getProposedSalary()) + " has been rejected.",
                    "PAYROLL",
                    "/payroll",
                    null
            ));
        } catch (Exception e) {
            log.error("Failed to notify HR requester: {}", e.getMessage());
        }

        AuditLogger.log(adminEmail, "SALARY_REVISION_REJECTED", employee.getEmployeeName(), "Proposed revision to ₹" + request.getProposedSalary() + " was rejected.");

        return toDTO(saved);
    }

    @Override
    public List<SalaryApprovalRequestDTO> getHistoryByEmployee(Long employeeId) {
        return requestRepository.findByEmployeeIdOrderByRequestedDateDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private SalaryApprovalRequestDTO toDTO(SalaryApprovalRequest r) {
        return SalaryApprovalRequestDTO.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getEmployeeName())
                .department(r.getEmployee().getDepartment())
                .designation(r.getEmployee().getDesignation())
                .previousSalary(r.getPreviousSalary())
                .proposedSalary(r.getProposedSalary())
                .reason(r.getReason())
                .requestedBy(r.getRequestedBy())
                .requestedDate(r.getRequestedDate())
                .status(r.getStatus())
                .approvedBy(r.getApprovedBy())
                .actionDate(r.getActionDate())
                .build();
    }
}
