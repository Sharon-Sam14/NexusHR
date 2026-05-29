package com.nexushr.service;

import com.nexushr.entity.Performance;
import com.nexushr.entity.PerformanceStatus;
import com.nexushr.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/*
 * ReviewCycleService
 *
 * Manages performance review cycles — scheduling, status transitions,
 * and reporting on cycle-wide completion rates.
 *
 * A "review cycle" is identified by its reviewPeriod string (e.g., "Q1 2026").
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@SuppressWarnings("null")
public class ReviewCycleService {

    private final PerformanceRepository performanceRepository;

    public record CycleSummary(
            String reviewPeriod,
            int total,
            int drafted,
            int submitted,
            int acknowledged,
            double completionRate
    ) {}

    /*
     * Returns a summary of a specific review cycle's completion state.
     */
    public CycleSummary getCycleSummary(String reviewPeriod) {
        List<Performance> reviews = performanceRepository.findByReviewPeriod(reviewPeriod);
        int total = reviews.size();
        if (total == 0) {
            return new CycleSummary(reviewPeriod, 0, 0, 0, 0, 0.0);
        }

        long drafted      = reviews.stream().filter(r -> r.getStatus() == PerformanceStatus.DRAFT).count();
        long submitted    = reviews.stream().filter(r -> r.getStatus() == PerformanceStatus.SUBMITTED).count();
        long acknowledged = reviews.stream().filter(r -> r.getStatus() == PerformanceStatus.ACKNOWLEDGED).count();

        double completionRate = (double) acknowledged / total * 100.0;
        log.info("[REVIEW-CYCLE] {} — total={}, acknowledged={}, rate={}%", reviewPeriod, total, acknowledged, completionRate);

        return new CycleSummary(reviewPeriod, total, (int) drafted, (int) submitted, (int) acknowledged, completionRate);
    }

    /*
     * Advances a performance review from DRAFT → SUBMITTED.
     */
    public Performance submitReview(Long performanceId) {
        Performance review = findById(performanceId);
        review.setStatus(PerformanceStatus.SUBMITTED);
        review.setReviewDate(LocalDate.now());
        return performanceRepository.save(review);
    }

    /*
     * Acknowledges a review (employee confirms receipt) SUBMITTED → ACKNOWLEDGED.
     */
    public Performance acknowledgeReview(Long performanceId) {
        Performance review = findById(performanceId);
        if (review.getStatus() != PerformanceStatus.SUBMITTED) {
            throw new RuntimeException("Review must be SUBMITTED before acknowledgment. Current: " + review.getStatus());
        }
        review.setStatus(PerformanceStatus.ACKNOWLEDGED);
        return performanceRepository.save(review);
    }

    /*
     * Returns all review periods that have at least one entry.
     */
    public List<String> getActiveReviewPeriods() {
        return performanceRepository.findAll().stream()
                .map(Performance::getReviewPeriod)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /*
     * Returns summaries for all review cycles.
     */
    public List<CycleSummary> getAllCycleSummaries() {
        return getActiveReviewPeriods().stream()
                .map(this::getCycleSummary)
                .collect(Collectors.toList());
    }

    private Performance findById(Long id) {
        return performanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performance review not found: " + id));
    }
}
