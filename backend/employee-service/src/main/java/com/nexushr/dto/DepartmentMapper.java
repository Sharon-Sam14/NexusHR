package com.nexushr.dto;

import com.nexushr.entity.Department;
import com.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * DepartmentMapper — Converts between Department entity and DTOs.
 *
 * Injected as a Spring bean so it can access EmployeeRepository
 * to compute the employeeCount for each DepartmentResponse.
 */
@Component
@RequiredArgsConstructor
public class DepartmentMapper {

    private final EmployeeRepository employeeRepository;

    /**
     * Maps a DepartmentRequest to a new Department entity.
     * Used during CREATE operations.
     */
    public Department toEntity(DepartmentRequest request) {
        return Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .headName(request.getHeadName())
                .active(request.isActive())
                .build();
    }

    /**
     * Applies fields from a DepartmentRequest onto an existing entity.
     * Used during UPDATE operations — preserves the entity id.
     */
    public void updateEntity(Department existing, DepartmentRequest request) {
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setHeadName(request.getHeadName());
        existing.setActive(request.isActive());
    }

    /**
     * Maps a Department entity to a DepartmentResponse DTO.
     * Queries the employee count for this department name.
     */
    public DepartmentResponse toResponse(Department department) {
        long count = employeeRepository.countByDepartment(department.getName());
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .headName(department.getHeadName())
                .active(department.isActive())
                .employeeCount(count)
                .build();
    }
}
