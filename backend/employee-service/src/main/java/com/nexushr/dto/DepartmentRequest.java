package com.nexushr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DepartmentRequest — Inbound DTO for creating and updating departments.
 *
 * Decouples the API boundary from the JPA entity.
 * Bean Validation annotations enforce input correctness before the service layer is reached.
 */
@Data
public class DepartmentRequest {

    @NotBlank(message = "Department name must not be blank.")
    @Size(max = 100, message = "Department name must not exceed 100 characters.")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters.")
    private String description;

    private String headName;

    private boolean active = true;
}
