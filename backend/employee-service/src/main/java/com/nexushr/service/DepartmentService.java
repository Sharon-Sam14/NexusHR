package com.nexushr.service;

import com.nexushr.dto.DepartmentRequest;
import com.nexushr.dto.DepartmentResponse;

import java.util.List;

/**
 * DepartmentService — Service interface for department management.
 *
 * All methods use DTOs at the boundary.
 * No JPA entity is exposed outside the service layer.
 */
public interface DepartmentService {

    DepartmentResponse createDepartment(DepartmentRequest request);

    DepartmentResponse updateDepartment(Long id, DepartmentRequest request);

    List<DepartmentResponse> getAllDepartments();

    void deleteDepartment(Long id);
}
