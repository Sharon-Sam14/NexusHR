package com.nexushr.repository;

import com.nexushr.entity.Goal;
import com.nexushr.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/*
 * GoalRepository — Spring Data JPA repository for Goal entity.
 */
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByEmployeeId(Long employeeId);
    List<Goal> findByEmployeeIdAndStatus(Long employeeId, GoalStatus status);
    List<Goal> findByReviewPeriod(String reviewPeriod);
}
