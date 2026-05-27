package com.nexushr.repository;

import com.nexushr.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findByEmployeeId(Long employeeId);

    List<Performance> findByReviewPeriod(String reviewPeriod);

    @Query("SELECT COALESCE(AVG(p.overallRating), 0) FROM Performance p")
    Double findAverageOverallRating();

}
