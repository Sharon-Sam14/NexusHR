package com.nexushr.repository;

import com.nexushr.entity.Employee;
import com.nexushr.entity.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByDepartment(String department);

    List<Employee> findByStatus(EmployeeStatus status);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(EmployeeStatus status);

}