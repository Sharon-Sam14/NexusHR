package com.nexushr.service.impl;

import com.nexushr.dto.PayrollDTO;
import com.nexushr.entity.Attendance;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Payroll;
import com.nexushr.entity.PayrollStatus;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PayrollRepository;
import com.nexushr.payroll.PayrollCalculator;
import com.nexushr.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.nexushr.util.AuditLogger;
import org.springframework.transaction.annotation.Transactional;

/*
 * Payroll Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
@Transactional
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollCalculator payrollCalculator;

    @Override
    public PayrollDTO generatePayroll(PayrollDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        double basicSalary = dto.getBasicSalary() != null ? dto.getBasicSalary() : employee.getSalary();
        double bonus = dto.getBonus() != null ? dto.getBonus() : 0.0;
        double deductions = dto.getDeductions() != null ? dto.getDeductions() : 0.0;
        double allowances = dto.getAllowances() != null ? dto.getAllowances() : 0.0;
        double reimbursements = dto.getReimbursements() != null ? dto.getReimbursements() : 0.0;

        // Calculate overtime hours from attendance logs
        double overtimeHours = 0.0;
        List<Attendance> attendances = attendanceRepository.findByEmployeeId(employee.getId());
        if (attendances != null) {
            for (Attendance att : attendances) {
                if (att.getDate() != null && att.getDate().getMonthValue() == dto.getMonth() && att.getDate().getYear() == dto.getYear()) {
                    if (att.getWorkHours() != null && att.getWorkHours() > 9.0) {
                        overtimeHours += (att.getWorkHours() - 9.0);
                    }
                }
            }
        }

        int workingDays = dto.getWorkingDays() != null ? dto.getWorkingDays() : 22;
        double hourlyRate = basicSalary / (workingDays * 9.0);

        // Run payroll calculations using our PayrollCalculator
        PayrollCalculator.PayrollResult result = payrollCalculator.calculate(
                basicSalary, bonus, deductions, overtimeHours, hourlyRate, allowances, reimbursements
        );

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PayrollStatus initialStatus = isAdmin ? PayrollStatus.PROCESSED : PayrollStatus.DRAFT;

        // Overwrite existing draft if present
        List<Payroll> existingPayrolls = payrollRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), dto.getMonth(), dto.getYear());
        if (existingPayrolls != null && !existingPayrolls.isEmpty()) {
            Payroll existing = existingPayrolls.get(0);
            if (existing.getStatus() == PayrollStatus.PAID) {
                throw new RuntimeException("Payroll has already been paid for this period.");
            }
            existing.setBasicSalary(result.basicSalary());
            existing.setBonus(result.bonus());
            existing.setDeductions(result.deductions());
            existing.setTax(result.taxAmount());
            existing.setOvertimeHours(result.overtimeHours());
            existing.setOvertimePay(result.overtimePay());
            existing.setAllowances(result.allowances());
            existing.setReimbursements(result.reimbursements());
            existing.setNetSalary(result.netSalary());
            existing.setWorkingDays(workingDays);
            existing.setDaysPresent(dto.getDaysPresent() != null ? dto.getDaysPresent() : workingDays);
            existing.setRemarks(dto.getRemarks() != null ? dto.getRemarks() : ("Overtime calc: " + result.taxBracketLabel()));
            existing.setStatus(initialStatus);
            Payroll savedExisting = payrollRepository.save(existing);
            AuditLogger.log(AuditLogger.getCurrentUserEmail(), "PAYROLL_DRAFT_UPDATED", employee.getEmployeeName(), "Month: " + dto.getMonth() + ", Year: " + dto.getYear());
            return toDTO(savedExisting);
        }

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(dto.getMonth())
                .year(dto.getYear())
                .basicSalary(result.basicSalary())
                .bonus(result.bonus())
                .deductions(result.deductions())
                .tax(result.taxAmount())
                .overtimeHours(result.overtimeHours())
                .overtimePay(result.overtimePay())
                .allowances(result.allowances())
                .reimbursements(result.reimbursements())
                .netSalary(result.netSalary())
                .workingDays(workingDays)
                .daysPresent(dto.getDaysPresent() != null ? dto.getDaysPresent() : workingDays)
                .remarks(dto.getRemarks() != null ? dto.getRemarks() : ("Overtime calc: " + result.taxBracketLabel()))
                .status(initialStatus)
                .build();

        Payroll saved = payrollRepository.save(payroll);
        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "PAYROLL_DRAFT_CREATED", employee.getEmployeeName(), "Month: " + dto.getMonth() + ", Year: " + dto.getYear());
        return toDTO(saved);
    }

    @Override
    public List<PayrollDTO> getAllPayrolls() {
        return payrollRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<PayrollDTO> getPayrollByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<PayrollDTO> getPayrollByMonth(Integer month, Integer year) {
        return payrollRepository.findByMonthAndYear(month, year).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public PayrollDTO updatePayrollStatus(Long id, String status) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String actor = auth != null ? auth.getName() : "SYSTEM";

        PayrollStatus targetStatus = PayrollStatus.valueOf(status);

        if (!isAdmin) {
            if (targetStatus == PayrollStatus.PENDING_REOPEN) {
                if (payroll.getStatus() != PayrollStatus.APPROVED && payroll.getStatus() != PayrollStatus.PROCESSED) {
                    throw new RuntimeException("HR can only request to reopen APPROVED or PROCESSED payrolls.");
                }
            } else {
                if (payroll.getStatus() != PayrollStatus.DRAFT) {
                    throw new RuntimeException("HR can only modify payrolls in DRAFT status.");
                }
                if (targetStatus != PayrollStatus.PENDING_APPROVAL && targetStatus != PayrollStatus.CANCELLED) {
                    throw new RuntimeException("HR can only submit for approval or cancel draft payrolls.");
                }
            }
        } else {
            // Admin checks
            if (targetStatus == PayrollStatus.DRAFT) {
                if (payroll.getStatus() != PayrollStatus.PENDING_REOPEN) {
                    throw new RuntimeException("Admin can only return payroll to DRAFT if a reopen was requested.");
                }
            }
        }

        payroll.setStatus(targetStatus);
        Payroll saved = payrollRepository.save(payroll);
        AuditLogger.log(actor, "PAYROLL_STATUS_UPDATE", saved.getEmployee().getEmployeeName(), "Updated status to: " + targetStatus);
        return toDTO(saved);
    }

    @Override
    public PayrollDTO getPayrollById(Long id) {
        return toDTO(payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll not found")));
    }

    private PayrollDTO toDTO(Payroll p) {
        return PayrollDTO.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getEmployeeName())
                .department(p.getEmployee().getDepartment())
                .designation(p.getEmployee().getDesignation())
                .month(p.getMonth())
                .year(p.getYear())
                .basicSalary(p.getBasicSalary())
                .bonus(p.getBonus())
                .deductions(p.getDeductions())
                .tax(p.getTax())
                .overtimeHours(p.getOvertimeHours())
                .overtimePay(p.getOvertimePay())
                .allowances(p.getAllowances())
                .reimbursements(p.getReimbursements())
                .netSalary(p.getNetSalary())
                .status(p.getStatus())
                .workingDays(p.getWorkingDays())
                .daysPresent(p.getDaysPresent())
                .remarks(p.getRemarks())
                .build();
    }

}