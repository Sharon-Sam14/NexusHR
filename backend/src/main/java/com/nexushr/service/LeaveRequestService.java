package com.nexushr.service;

import com.nexushr.dto.LeaveRequestDTO;

import java.util.List;

/*
 * Leave Request Service Interface
 */
public interface LeaveRequestService {

    LeaveRequestDTO applyLeave(LeaveRequestDTO dto);

    LeaveRequestDTO approveLeave(Long id, String approvedBy, String remarks);

    LeaveRequestDTO rejectLeave(Long id, String approvedBy, String remarks);

    List<LeaveRequestDTO> getAllLeaveRequests();

    List<LeaveRequestDTO> getLeaveRequestsByEmployee(Long employeeId);

    List<LeaveRequestDTO> getPendingLeaveRequests();

    void cancelLeave(Long id);

}