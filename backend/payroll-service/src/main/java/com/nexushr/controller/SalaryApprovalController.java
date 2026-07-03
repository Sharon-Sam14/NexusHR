package com.nexushr.controller;

import com.nexushr.dto.SalaryApprovalRequestDTO;
import com.nexushr.service.SalaryApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll/salary-approval")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SalaryApprovalController {

    private final SalaryApprovalService approvalService;

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<SalaryApprovalRequestDTO> createRequest(@RequestBody SalaryApprovalRequestDTO dto) {
        String callerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(approvalService.createRequest(dto, callerEmail));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryApprovalRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(approvalService.getPendingRequests());
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<SalaryApprovalRequestDTO>> getHistoryRequests() {
        return ResponseEntity.ok(approvalService.getAllRequests());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalaryApprovalRequestDTO> approveRequest(@PathVariable Long id) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(approvalService.approveRequest(id, adminEmail));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalaryApprovalRequestDTO> rejectRequest(@PathVariable Long id) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(approvalService.rejectRequest(id, adminEmail));
    }

    /*
     * GET /api/payroll/salary-approval/employee/{id}
     * Returns the full salary revision history for a specific employee.
     * Available to both Admin and HR.
     */
    @GetMapping("/employee/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<SalaryApprovalRequestDTO>> getEmployeeHistory(@PathVariable Long id) {
        return ResponseEntity.ok(approvalService.getHistoryByEmployee(id));
    }
}
