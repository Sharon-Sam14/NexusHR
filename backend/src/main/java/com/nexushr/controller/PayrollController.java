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
    public ResponseEntity<List<PayrollDTO>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollDTO> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployee(employeeId));
    }

    @GetMapping("/month/{month}/year/{year}")
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

}