package com.nexushr.service.impl;

import com.nexushr.dto.LeaveRequestDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.LeaveRequest;
import com.nexushr.entity.LeaveStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.LeaveRequestRepository;
import com.nexushr.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

/*
 * Leave Request Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public LeaveRequestDTO applyLeave(LeaveRequestDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        int totalDays = (int) ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .totalDays(totalDays)
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .appliedDate(LocalDate.now())
                .build();

        return toDTO(leaveRequestRepository.save(request));
    }

    @Override
    public LeaveRequestDTO approveLeave(Long id, String approvedBy, String remarks) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        request.setStatus(LeaveStatus.APPROVED);
        request.setApprovedBy(approvedBy);
        request.setApprovalRemarks(remarks);

        return toDTO(leaveRequestRepository.save(request));
    }

    @Override
    public LeaveRequestDTO rejectLeave(Long id, String approvedBy, String remarks) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        request.setStatus(LeaveStatus.REJECTED);
        request.setApprovedBy(approvedBy);
        request.setApprovalRemarks(remarks);

        return toDTO(leaveRequestRepository.save(request));
    }

    @Override
    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDTO> getLeaveRequestsByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDTO> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public void cancelLeave(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus(LeaveStatus.CANCELLED);
        leaveRequestRepository.save(request);
    }

    private LeaveRequestDTO toDTO(LeaveRequest r) {
        return LeaveRequestDTO.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getEmployeeName())
                .department(r.getEmployee().getDepartment())
                .leaveType(r.getLeaveType())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .totalDays(r.getTotalDays())
                .reason(r.getReason())
                .status(r.getStatus())
                .approvedBy(r.getApprovedBy())
                .approvalRemarks(r.getApprovalRemarks())
                .appliedDate(r.getAppliedDate())
                .build();
    }

}