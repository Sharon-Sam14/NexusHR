package com.nexushr.service;

import com.nexushr.dto.SalaryApprovalRequestDTO;
import java.util.List;

public interface SalaryApprovalService {

    SalaryApprovalRequestDTO createRequest(SalaryApprovalRequestDTO dto, String hrEmail);

    List<SalaryApprovalRequestDTO> getPendingRequests();

    List<SalaryApprovalRequestDTO> getAllRequests();

    SalaryApprovalRequestDTO approveRequest(Long id, String adminEmail);

    SalaryApprovalRequestDTO rejectRequest(Long id, String adminEmail);

    /*
     * Returns the full chronological salary revision history for a specific employee.
     */
    List<SalaryApprovalRequestDTO> getHistoryByEmployee(Long employeeId);

}
