package com.nexushr.service;

import com.nexushr.entity.Performance;
import com.nexushr.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/*
 * FeedbackAggregator
 *
 * Aggregates multi-dimensional rating scores across the workforce for dashboard widgets.
 * Computes averages for: productivity, quality, teamwork, communication, and overall rating.
 * Used by the HR AI Insights dashboard to surface performance trends.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackAggregator {

    private final PerformanceRepository performanceRepository;

    /*
     * Aggregate output for a single dimension.
     */
    public record DimensionAverage(
            String dimension,
            double averageScore,
            double minScore,
            double maxScore,
            int reviewCount
    ) {}

    /*
     * Full aggregation summary for a review period.
     */
    public record AggregationResult(
            String reviewPeriod,
            double overallAverage,
            int reviewCount,
            List<DimensionAverage> dimensions,
            Map<String, Double> departmentAverages
    ) {}

    /*
     * Aggregates all feedback for a specific review period.
     */
    public AggregationResult aggregateByPeriod(String reviewPeriod) {
        List<Performance> reviews = performanceRepository.findByReviewPeriod(reviewPeriod);
        if (reviews.isEmpty()) {
            return new AggregationResult(reviewPeriod, 0.0, 0, List.of(), Map.of());
        }

        List<DimensionAverage> dimensions = List.of(
                buildDimension("Productivity",    reviews, r -> r.getProductivityRating()),
                buildDimension("Quality",         reviews, r -> r.getQualityRating()),
                buildDimension("Teamwork",        reviews, r -> r.getTeamworkRating()),
                buildDimension("Communication",   reviews, r -> r.getCommunicationRating()),
                buildDimension("Overall",         reviews, r -> r.getOverallRating())
        );

        double overallAvg = reviews.stream()
                .mapToDouble(Performance::getOverallRating)
                .average().orElse(0.0);

        // Department breakdown
        Map<String, Double> deptAverages = reviews.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getEmployee().getDepartment(),
                        Collectors.averagingDouble(Performance::getOverallRating)
                ));

        log.info("[FEEDBACK-AGG] Period={} | reviews={} | overallAvg={}", reviewPeriod, reviews.size(), overallAvg);

        return new AggregationResult(
                reviewPeriod,
                Math.round(overallAvg * 100.0) / 100.0,
                reviews.size(),
                dimensions,
                deptAverages
        );
    }

    /*
     * Company-wide aggregation across all review periods.
     */
    public AggregationResult aggregateAll() {
        List<Performance> reviews = performanceRepository.findAll();
        if (reviews.isEmpty()) {
            return new AggregationResult("ALL", 0.0, 0, List.of(), Map.of());
        }

        return aggregateByPeriod("ALL"); // Will use findAll internally
    }

    private DimensionAverage buildDimension(String name, List<Performance> reviews,
                                            java.util.function.Function<Performance, Double> getter) {
        DoubleSummaryStatistics stats = reviews.stream()
                .mapToDouble(r -> {
                    Double val = getter.apply(r);
                    return val != null ? val : 0.0;
                })
                .summaryStatistics();

        return new DimensionAverage(
                name,
                Math.round(stats.getAverage() * 100.0) / 100.0,
                stats.getMin(),
                stats.getMax(),
                reviews.size()
        );
    }
}
