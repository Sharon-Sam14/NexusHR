package com.nexushr.service.impl;

import com.nexushr.dto.PerformanceDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Performance;
import com.nexushr.entity.PerformanceStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PerformanceRepository;
import com.nexushr.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/*
 * Performance Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public PerformanceDTO createReview(PerformanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Performance performance = Performance.builder()
                .employee(employee)
                .reviewPeriod(dto.getReviewPeriod())
                .reviewDate(dto.getReviewDate())
                .overallRating(dto.getOverallRating())
                .productivityRating(dto.getProductivityRating())
                .qualityRating(dto.getQualityRating())
                .teamworkRating(dto.getTeamworkRating())
                .communicationRating(dto.getCommunicationRating())
                .comments(dto.getComments())
                .goals(dto.getGoals())
                .reviewedBy(dto.getReviewedBy())
                .status(dto.getStatus() != null ? dto.getStatus() : PerformanceStatus.DRAFT)
                .build();

        return toDTO(performanceRepository.save(performance));
    }

    @Override
    public PerformanceDTO updateReview(Long id, PerformanceDTO dto) {
        Performance existing = performanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performance review not found"));

        existing.setReviewPeriod(dto.getReviewPeriod());
        existing.setReviewDate(dto.getReviewDate());
        existing.setOverallRating(dto.getOverallRating());
        existing.setProductivityRating(dto.getProductivityRating());
        existing.setQualityRating(dto.getQualityRating());
        existing.setTeamworkRating(dto.getTeamworkRating());
        existing.setCommunicationRating(dto.getCommunicationRating());
        existing.setComments(dto.getComments());
        existing.setGoals(dto.getGoals());
        existing.setReviewedBy(dto.getReviewedBy());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());

        return toDTO(performanceRepository.save(existing));
    }

    @Override
    public List<PerformanceDTO> getAllReviews() {
        return performanceRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<PerformanceDTO> getReviewsByEmployee(Long employeeId) {
        return performanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public PerformanceDTO getReviewById(Long id) {
        return toDTO(performanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performance review not found")));
    }

    @Override
    public void deleteReview(Long id) {
        performanceRepository.deleteById(id);
    }

    private PerformanceDTO toDTO(Performance p) {
        return PerformanceDTO.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getEmployeeName())
                .department(p.getEmployee().getDepartment())
                .reviewPeriod(p.getReviewPeriod())
                .reviewDate(p.getReviewDate())
                .overallRating(p.getOverallRating())
                .productivityRating(p.getProductivityRating())
                .qualityRating(p.getQualityRating())
                .teamworkRating(p.getTeamworkRating())
                .communicationRating(p.getCommunicationRating())
                .comments(p.getComments())
                .goals(p.getGoals())
                .reviewedBy(p.getReviewedBy())
                .status(p.getStatus())
                .build();
    }

}
