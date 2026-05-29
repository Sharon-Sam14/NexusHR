package com.nexushr.controller;

import com.nexushr.dto.PerformanceDTO;
import com.nexushr.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<PerformanceDTO>> getAllReviews() {
        return ResponseEntity.ok(performanceService.getAllReviews());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isPerformanceOwner(#id)")
    public ResponseEntity<PerformanceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.getReviewById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("@securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<PerformanceDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(performanceService.getReviewsByEmployee(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<PerformanceDTO> createReview(@RequestBody PerformanceDTO dto) {
        return ResponseEntity.ok(performanceService.createReview(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isPerformanceOwner(#id)")
    public ResponseEntity<PerformanceDTO> updateReview(@PathVariable Long id, @RequestBody PerformanceDTO dto) {
        return ResponseEntity.ok(performanceService.updateReview(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        performanceService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

}
