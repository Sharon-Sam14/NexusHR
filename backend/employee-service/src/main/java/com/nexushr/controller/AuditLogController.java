package com.nexushr.controller;

import com.nexushr.entity.AuditLog;
import com.nexushr.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    /*
     * Create an immutable audit log entry.
     * Called internally by other services via the AuditLogger utility.
     */
    @PostMapping
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody Map<String, String> body) {
        AuditLog log = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .actor(body.getOrDefault("actor", "SYSTEM"))
                .action(body.getOrDefault("action", "UNKNOWN"))
                .target(body.getOrDefault("target", "UNKNOWN"))
                .details(body.getOrDefault("details", ""))
                .build();
        return ResponseEntity.ok(auditLogRepository.save(log));
    }

    /*
     * GET /api/audit-logs
     * Optional query params:
     *   - search: free-text across actor/action/target/details
     *   - action: action category prefix filter (e.g. PAYROLL, SALARY, EMPLOYEE, LEAVE)
     *   - target: filter by target entity name
     *
     * Admin-only endpoint.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String target
    ) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(auditLogRepository.search(search.trim()));
        }
        if (action != null && !action.isBlank() && !action.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(auditLogRepository.findByActionPrefixOrderByTimestampDesc(action.toUpperCase() + "_"));
        }
        if (target != null && !target.isBlank()) {
            return ResponseEntity.ok(auditLogRepository.findByTargetContainingIgnoreCaseOrderByTimestampDesc(target.trim()));
        }
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }
}

