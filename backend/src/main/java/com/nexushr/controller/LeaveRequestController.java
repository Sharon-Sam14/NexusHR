package com.nexushr.controller;

import com.nexushr.dto.LeaveRequestDTO;
import com.nexushr.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(leaveRequestService.getPendingLeaveRequests());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("@securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<LeaveRequestDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByEmployee(employeeId));
    }

    @PostMapping("/apply")
    @PreAuthorize("@securityHelper.isOwner(#dto.employeeId)")
    public ResponseEntity<LeaveRequestDTO> applyLeave(@RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(leaveRequestService.applyLeave(dto));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveRequestDTO> approveLeave(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(leaveRequestService.approveLeave(
                id, body.get("approvedBy"), body.get("remarks")));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveRequestDTO> rejectLeave(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(leaveRequestService.rejectLeave(
                id, body.get("approvedBy"), body.get("remarks")));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isLeaveOwner(#id)")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        leaveRequestService.cancelLeave(id);
        return ResponseEntity.noContent().build();
    }

}