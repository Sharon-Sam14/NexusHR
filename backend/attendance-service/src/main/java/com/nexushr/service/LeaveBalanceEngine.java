package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.LeaveRequest;
import com.nexushr.entity.LeaveStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/*
 * LeaveBalanceEngine
 *
 * Provides a dedicated, auditable service for leave balance pool operations.
 * All deduction and restoration logic is centralized here rather than
 * scattered across controller/service methods, ensuring atomicity via @Transactional.
 *
 * Responsibility:
 *   - Check balance sufficiency before a leave application.
 *   - Deduct balance on approval.
 *   - Restore balance on rejection or cancellation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@SuppressWarnings("null")
public class LeaveBalanceEngine {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    /*
     * Result record returned by all balance operations.
     */
    public record BalanceResult(
            Long employeeId,
            String employeeName,
            int previousBalance,
            int newBalance,
            int daysAffected,
            String operation,
            boolean success,
            String message
    ) {}

    /*
     * Validates that the employee has enough remaining leave days.
     * Throws RuntimeException if the balance is insufficient.
     */
    public void assertSufficientBalance(Long employeeId, int requestedDays) {
        Employee employee = findEmployee(employeeId);
        if (employee.getLeaveBalance() < requestedDays) {
            throw new RuntimeException(
                    "Insufficient leave balance for " + employee.getEmployeeName() +
                    ". Available: " + employee.getLeaveBalance() + " days, Requested: " + requestedDays + " days."
            );
        }
    }

    /*
     * Deducts leave days from the employee's pool.
     * Called when a leave request is APPROVED.
     */
    public BalanceResult deductBalance(Long leaveRequestId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + leaveRequestId));

        Employee employee = request.getEmployee();
        int prev = employee.getLeaveBalance();
        int days = request.getTotalDays();

        if (prev < days) {
            throw new RuntimeException("Insufficient balance to deduct. Available: " + prev + ", Requested: " + days);
        }

        employee.setLeaveBalance(prev - days);
        employeeRepository.save(employee);

        log.info("[LEAVE-BALANCE] DEDUCT | employee={} | days={} | {} → {}",
                employee.getEmployeeName(), days, prev, employee.getLeaveBalance());

        return new BalanceResult(
                employee.getId(), employee.getEmployeeName(),
                prev, employee.getLeaveBalance(), days,
                "DEDUCT", true,
                days + " days deducted on leave approval."
        );
    }

    /*
     * Restores leave days back to the employee's pool.
     * Called when a leave request is REJECTED or CANCELLED after prior approval.
     */
    public BalanceResult restoreBalance(Long leaveRequestId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + leaveRequestId));

        // Only restore if the leave was previously APPROVED (balance was already deducted)
        if (request.getStatus() != LeaveStatus.APPROVED) {
            log.info("[LEAVE-BALANCE] RESTORE skipped — request was not APPROVED (status={})", request.getStatus());
            Employee emp = request.getEmployee();
            return new BalanceResult(emp.getId(), emp.getEmployeeName(),
                    emp.getLeaveBalance(), emp.getLeaveBalance(), 0,
                    "RESTORE_SKIPPED", true,
                    "No balance restoration needed — request was not in APPROVED state.");
        }

        Employee employee = request.getEmployee();
        int prev = employee.getLeaveBalance();
        int days = request.getTotalDays();

        employee.setLeaveBalance(prev + days);
        employeeRepository.save(employee);

        log.info("[LEAVE-BALANCE] RESTORE | employee={} | days={} | {} → {}",
                employee.getEmployeeName(), days, prev, employee.getLeaveBalance());

        return new BalanceResult(
                employee.getId(), employee.getEmployeeName(),
                prev, employee.getLeaveBalance(), days,
                "RESTORE", true,
                days + " days restored on leave rejection/cancellation."
        );
    }

    /*
     * Returns the current leave pool balance summary for an employee.
     */
    public BalanceResult getBalance(Long employeeId) {
        Employee employee = findEmployee(employeeId);
        return new BalanceResult(
                employee.getId(), employee.getEmployeeName(),
                employee.getLeaveBalance(), employee.getLeaveBalance(), 0,
                "QUERY", true,
                "Current leave balance."
        );
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
    }
}
