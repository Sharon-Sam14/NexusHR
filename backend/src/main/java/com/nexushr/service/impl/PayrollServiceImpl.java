package com.nexushr.service.impl;

import com.nexushr.dto.PayrollDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Payroll;
import com.nexushr.entity.PayrollStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PayrollRepository;
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

    @Override
    public PayrollDTO generatePayroll(PayrollDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        double basicSalary = dto.getBasicSalary() != null ? dto.getBasicSalary() : employee.getSalary();
        double bonus = dto.getBonus() != null ? dto.getBonus() : 0.0;
        double deductions = dto.getDeductions() != null ? dto.getDeductions() : 0.0;
        double tax = dto.getTax() != null ? dto.getTax() : 0.0;
        double netSalary = basicSalary + bonus - deductions - tax;

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(dto.getMonth())
                .year(dto.getYear())
                .basicSalary(basicSalary)
                .bonus(bonus)
                .deductions(deductions)
                .tax(tax)
                .netSalary(netSalary)
                .workingDays(dto.getWorkingDays())
                .daysPresent(dto.getDaysPresent())
                .remarks(dto.getRemarks())
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
                .netSalary(p.getNetSalary())
                .status(p.getStatus())
                .workingDays(p.getWorkingDays())
                .daysPresent(p.getDaysPresent())
                .remarks(p.getRemarks())
                .build();
    }

}