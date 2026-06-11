package com.nexushr.controller;

import com.nexushr.dto.PayrollDTO;
import com.nexushr.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PayrollDTO>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isPayrollOwner(#id)")
    public ResponseEntity<PayrollDTO> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("@securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<PayrollDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployee(employeeId));
    }

    @GetMapping("/month/{month}/year/{year}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PayrollDTO>> getByMonth(@PathVariable Integer month, @PathVariable Integer year) {
        return ResponseEntity.ok(payrollService.getPayrollByMonth(month, year));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<PayrollDTO> generatePayroll(@RequestBody PayrollDTO dto) {
        return ResponseEntity.ok(payrollService.generatePayroll(dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<PayrollDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(payrollService.updatePayrollStatus(id, body.get("status")));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isPayrollOwner(#id)")
    public ResponseEntity<byte[]> downloadPayrollCsv(@PathVariable Long id) {
        PayrollDTO p = payrollService.getPayrollById(id);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Parameter,Value\n");
        csv.append("Payslip ID,").append(p.getId()).append("\n");
        csv.append("Employee Name,\"").append(p.getEmployeeName()).append("\"\n");
        csv.append("Department,\"").append(p.getDepartment()).append("\"\n");
        csv.append("Designation,\"").append(p.getDesignation()).append("\"\n");
        csv.append("Month / Year,").append(p.getMonth()).append(" / ").append(p.getYear()).append("\n");
        csv.append("Basic Salary,").append(p.getBasicSalary()).append("\n");
        csv.append("Bonus,").append(p.getBonus()).append("\n");
        csv.append("Deductions,").append(p.getDeductions()).append("\n");
        csv.append("Tax Deduction,").append(p.getTax()).append("\n");
        csv.append("Net Salary Payout,").append(p.getNetSalary()).append("\n");
        csv.append("Payment Status,").append(p.getStatus()).append("\n");
        csv.append("Working Days,").append(p.getWorkingDays()).append("\n");
        csv.append("Days Present,").append(p.getDaysPresent()).append("\n");
        csv.append("Remarks,\"").append(p.getRemarks() != null ? p.getRemarks().replace("\"", "\"\"") : "").append("\"\n");

        byte[] data = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payslip_" + p.getId() + ".csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(data);
    }

}