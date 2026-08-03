package com.nexushr.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DepartmentResponse — Outbound DTO returned to the frontend.
 *
 * Fields match exactly what Departments.jsx reads:
 *   id, name, description, headName, active, employeeCount
 *
 * The employeeCount field satisfies the frontend's:
 *   dept.employeeCount ?? dept.employeesCount ?? 0
 */
@Data
@Builder
public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private String headName;
    private boolean active;

    /** Number of active employees in this department. Maps to `dept.employeeCount` in the frontend. */
    private long employeeCount;
}
