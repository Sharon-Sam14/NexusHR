package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.Goal;
import com.nexushr.entity.GoalStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
 * GoalService
 *
 * Manages employee performance goals within the 360-degree review cycle.
 * Allows creation, progress tracking, completion marking, and bulk listing
 * of individual or team goals.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final EmployeeRepository employeeRepository;

    /*
     * Creates a new goal for an employee.
     */
    public Goal createGoal(Long employeeId, String title, String description,
                           String reviewPeriod, java.time.LocalDate targetDate, String setBy) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        Goal goal = Goal.builder()
                .employee(employee)
                .title(title)
                .description(description)
                .reviewPeriod(reviewPeriod)
                .targetDate(targetDate)
                .progressPercent(0)
                .status(GoalStatus.IN_PROGRESS)
                .setBy(setBy)
                .build();

        Goal saved = goalRepository.save(goal);
        log.info("[GOAL] Created '{}' for employee {} ({})", title, employee.getEmployeeName(), reviewPeriod);
        return saved;
    }

    /*
     * Updates progress percentage (0–100) for a goal.
     * Auto-marks as COMPLETED when progress reaches 100%.
     */
    public Goal updateProgress(Long goalId, int progressPercent) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found: " + goalId));

        goal.setProgressPercent(Math.max(0, Math.min(100, progressPercent)));

        if (goal.getProgressPercent() == 100) {
            goal.setStatus(GoalStatus.COMPLETED);
            log.info("[GOAL] Goal '{}' marked COMPLETED for {}", goal.getTitle(), goal.getEmployee().getEmployeeName());
        }

        return goalRepository.save(goal);
    }

    /*
     * Retrieves all goals for a given employee.
     */
    public List<Goal> getGoalsForEmployee(Long employeeId) {
        return goalRepository.findByEmployeeId(employeeId);
    }

    /*
     * Retrieves all goals for a given review period.
     */
    public List<Goal> getGoalsByReviewPeriod(String reviewPeriod) {
        return goalRepository.findByReviewPeriod(reviewPeriod);
    }

    /*
     * Marks a goal as deferred or cancelled.
     */
    public Goal updateStatus(Long goalId, GoalStatus status) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found: " + goalId));
        goal.setStatus(status);
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long goalId) {
        goalRepository.deleteById(goalId);
    }
}
