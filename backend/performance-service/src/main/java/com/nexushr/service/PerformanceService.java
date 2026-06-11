package com.nexushr.service;

import com.nexushr.dto.PerformanceDTO;

import java.util.List;

/*
 * Performance Service Interface
 */
public interface PerformanceService {

    PerformanceDTO createReview(PerformanceDTO dto);

    PerformanceDTO updateReview(Long id, PerformanceDTO dto);

    List<PerformanceDTO> getAllReviews();

    List<PerformanceDTO> getReviewsByEmployee(Long employeeId);

    PerformanceDTO getReviewById(Long id);

    void deleteReview(Long id);

}
