package com.nexushr.service;

import com.nexushr.dto.PayrollDTO;

import java.util.List;

/*
 * Payroll Service Interface
 */
public interface PayrollService {

    PayrollDTO generatePayroll(PayrollDTO dto);

    List<PayrollDTO> getAllPayrolls();

    List<PayrollDTO> getPayrollByEmployee(Long employeeId);

    List<PayrollDTO> getPayrollByMonth(Integer month, Integer year);

    PayrollDTO updatePayrollStatus(Long id, String status);

    PayrollDTO getPayrollById(Long id);

}