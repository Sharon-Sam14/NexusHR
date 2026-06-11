package com.nexushr.service;

import com.nexushr.entity.Department;
import java.util.List;

public interface DepartmentService {
    Department createDepartment(Department department);
    Department updateDepartment(Long id, Department department);
    List<Department> getAllDepartments();
    void deleteDepartment(Long id);
}
