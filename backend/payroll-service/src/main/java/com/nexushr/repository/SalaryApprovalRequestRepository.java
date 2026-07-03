package com.nexushr.repository;

import com.nexushr.entity.SalaryApprovalRequest;
import com.nexushr.entity.SalaryApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaryApprovalRequestRepository extends JpaRepository<SalaryApprovalRequest, Long> {

    List<SalaryApprovalRequest> findByStatusOrderByRequestedDateDesc(SalaryApprovalStatus status);

    long countByStatus(SalaryApprovalStatus status);

    long countByRequestedByAndStatus(String requestedBy, SalaryApprovalStatus status);

    /*
     * Returns the complete salary revision history for a given employee,
     * most recent first. Used by the Salary History table in the Payroll UI.
     */
    List<SalaryApprovalRequest> findByEmployeeIdOrderByRequestedDateDesc(Long employeeId);
}

