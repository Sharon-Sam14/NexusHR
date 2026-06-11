package com.nexushr.controller;

import com.nexushr.service.GoalService;
import com.nexushr.service.ReviewCycleService;
import com.nexushr.service.FeedbackAggregator;
import com.nexushr.entity.Goal;
import com.nexushr.entity.GoalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/*
 * GoalsReviewController
 *
 * Exposes:
 *   POST   /api/performance/goals                        — create a goal for an employee
 *   GET    /api/performance/goals/employee/{id}          — get all goals for an employee
 *   PATCH  /api/performance/goals/{id}/progress          — update progress %
 *   PATCH  /api/performance/goals/{id}/status            — change goal status
 *   DELETE /api/performance/goals/{id}                   — delete a goal
 *
 *   GET    /api/performance/review-cycles                — list all review cycles with summaries
 *   GET    /api/performance/review-cycles/{period}       — summary for one cycle
 *   POST   /api/performance/{id}/submit                  — submit a review (DRAFT → SUBMITTED)
 *   POST   /api/performance/{id}/acknowledge             — acknowledge a review (SUBMITTED → ACKNOWLEDGED)
 *
 *   GET    /api/performance/feedback/{period}            — aggregated feedback for a review period
 */
@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GoalsReviewController {

    private final GoalService goalService;
    private final ReviewCycleService reviewCycleService;
    private final FeedbackAggregator feedbackAggregator;

    // ── Goals ────────────────────────────────────────────────────────────────

    @PostMapping("/goals")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<Goal> createGoal(@RequestBody Map<String, Object> body) {
        Long empId        = Long.parseLong(body.get("employeeId").toString());
        String title      = (String) body.get("title");
        String desc       = (String) body.getOrDefault("description", "");
        String period     = (String) body.getOrDefault("reviewPeriod", "");
        String dateStr    = (String) body.get("targetDate");
        String setBy      = (String) body.getOrDefault("setBy", "HR");
        LocalDate targetDate = dateStr != null ? LocalDate.parse(dateStr) : null;

        return ResponseEntity.ok(goalService.createGoal(empId, title, desc, period, targetDate, setBy));
    }

    @GetMapping("/goals/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<Goal>> getGoalsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(goalService.getGoalsForEmployee(employeeId));
    }

    @PatchMapping("/goals/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<Goal> updateGoalProgress(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(goalService.updateProgress(id, body.get("progressPercent")));
    }

    @PatchMapping("/goals/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<Goal> updateGoalStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        GoalStatus status = GoalStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(goalService.updateStatus(id, status));
    }

    @DeleteMapping("/goals/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    // ── Review Cycles ─────────────────────────────────────────────────────────

    @GetMapping("/review-cycles")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<List<ReviewCycleService.CycleSummary>> getAllCycles() {
        return ResponseEntity.ok(reviewCycleService.getAllCycleSummaries());
    }

    @GetMapping("/review-cycles/{period}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ReviewCycleService.CycleSummary> getCycleSummary(@PathVariable String period) {
        return ResponseEntity.ok(reviewCycleService.getCycleSummary(period));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> submitReview(@PathVariable Long id) {
        var review = reviewCycleService.submitReview(id);
        return ResponseEntity.ok(Map.of("id", review.getId(), "status", review.getStatus().name()));
    }

    @PostMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isPerformanceOwner(#id)")
    public ResponseEntity<Map<String, Object>> acknowledgeReview(@PathVariable Long id) {
        var review = reviewCycleService.acknowledgeReview(id);
        return ResponseEntity.ok(Map.of("id", review.getId(), "status", review.getStatus().name()));
    }

    // ── Feedback Aggregation ──────────────────────────────────────────────────

    @GetMapping("/feedback/{period}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<FeedbackAggregator.AggregationResult> getFeedbackAggregation(@PathVariable String period) {
        return ResponseEntity.ok(feedbackAggregator.aggregateByPeriod(period));
    }
}
