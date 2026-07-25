package com.nexushr.service.impl;

import com.nexushr.dto.PerformanceDTO;
import com.nexushr.dto.NotificationDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Performance;
import com.nexushr.entity.PerformanceStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PerformanceRepository;
import com.nexushr.service.PerformanceService;
import com.nexushr.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

/*
 * Performance Service Implementation
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

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

        PerformanceDTO saved = toDTO(performanceRepository.save(performance));

        if (saved.getStatus() == PerformanceStatus.SUBMITTED) {
            notifySubmitted(employee, saved);
        }

        return saved;
    }

    @Override
    public PerformanceDTO updateReview(Long id, PerformanceDTO dto) {
        Performance existing = performanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performance review not found"));

        PerformanceStatus oldStatus = existing.getStatus();

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

        PerformanceDTO saved = toDTO(performanceRepository.save(existing));

        if (saved.getStatus() == PerformanceStatus.SUBMITTED && oldStatus != PerformanceStatus.SUBMITTED) {
            notifySubmitted(existing.getEmployee(), saved);
        }

        if (saved.getStatus() == PerformanceStatus.ACKNOWLEDGED && oldStatus != PerformanceStatus.ACKNOWLEDGED) {
            notifyAcknowledged(existing.getEmployee(), saved);
        }

        return saved;
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

    private void notifySubmitted(Employee employee, PerformanceDTO review) {
        String title = "Performance Review Submitted";
        String message = review.getReviewedBy() + " has submitted your " + review.getReviewPeriod() +
                " performance review. Please view and acknowledge it.";
        sendNotification(employee.getEmail(), title, message);
    }

    private void notifyAcknowledged(Employee employee, PerformanceDTO review) {
        String title = "Performance Review Acknowledged";
        String message = employee.getEmployeeName() + " has acknowledged their " + review.getReviewPeriod() +
                " performance review.";
        sendNotification("hr@nexushr.com", title, message);
        sendNotification("admin@nexushr.com", title, message);
    }

    private void sendNotification(String email, String title, String message) {
        try {
            NotificationDTO notification = NotificationDTO.builder()
                    .userEmail(email)
                    .title(title)
                    .message(message)
                    .type("PERFORMANCE")
                    .actionUrl("/performance")
                    .build();
            notificationService.createNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send performance notification: " + e.getMessage());
        }
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
