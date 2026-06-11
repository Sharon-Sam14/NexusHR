package com.nexushr.controller;

import com.nexushr.service.OrgChartService;
import com.nexushr.service.OnboardingWorkflow;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * OrgChartController
 *
 * Exposes:
 *   GET /api/employees/org-chart               — full org chart grouped by department
 *   GET /api/employees/{id}/onboarding-status  — onboarding checklist for one employee
 */
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrgChartController {

    private final OrgChartService orgChartService;
    private final OnboardingWorkflow onboardingWorkflow;

    /*
     * Returns the full company org chart, grouped by department.
     * Each node includes the department head and all member summaries.
     */
    @GetMapping("/org-chart")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<List<OrgChartService.OrgNode>> getOrgChart() {
        return ResponseEntity.ok(orgChartService.buildOrgChart());
    }

    /*
     * Returns the onboarding completion status for a specific employee,
     * including step-by-step completion flags and hints for incomplete steps.
     */
    @GetMapping("/{id}/onboarding-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#id)")
    public ResponseEntity<OnboardingWorkflow.OnboardingStatus> getOnboardingStatus(@PathVariable Long id) {
        return ResponseEntity.ok(onboardingWorkflow.getStatus(id));
    }
}
