package com.nexushr.service;

import com.nexushr.dto.EmployeeDTO;

import java.util.List;

/*
 * Employee Service Interface
 */
public interface EmployeeService {

    List<EmployeeDTO> getAllEmployees();

    EmployeeDTO getEmployeeById(Long id);

    EmployeeDTO createEmployee(EmployeeDTO dto);

    EmployeeDTO updateEmployee(Long id, EmployeeDTO dto);

    void deleteEmployee(Long id);

    List<EmployeeDTO> getEmployeesByDepartment(String department);

}