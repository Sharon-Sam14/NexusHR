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
                basicSalary, bonus, deductions, overtimeHours, hourlyRate
        );

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
                .netSalary(result.netSalary())
                .workingDays(workingDays)
                .daysPresent(dto.getDaysPresent() != null ? dto.getDaysPresent() : workingDays)
                .remarks(dto.getRemarks() != null ? dto.getRemarks() : ("Overtime calc: " + result.taxBracketLabel()))
                .status(PayrollStatus.PROCESSED)
                .build();

        return toDTO(payrollRepository.save(payroll));
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
        payroll.setStatus(PayrollStatus.valueOf(status));
        return toDTO(payrollRepository.save(payroll));
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
                .netSalary(p.getNetSalary())
                .status(p.getStatus())
                .workingDays(p.getWorkingDays())
                .daysPresent(p.getDaysPresent())
                .remarks(p.getRemarks())
                .build();
    }

}