package com.nexushr.controller;

import com.nexushr.dto.LeaveRequestDTO;
import com.nexushr.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(leaveRequestService.getPendingLeaveRequests());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequestDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByEmployee(employeeId));
    }

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDTO> applyLeave(@RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(leaveRequestService.applyLeave(dto));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestDTO> approveLeave(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(leaveRequestService.approveLeave(
                id, body.get("approvedBy"), body.get("remarks")));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<LeaveRequestDTO> rejectLeave(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(leaveRequestService.rejectLeave(
                id, body.get("approvedBy"), body.get("remarks")));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        leaveRequestService.cancelLeave(id);
        return ResponseEntity.noContent().build();
    }

}