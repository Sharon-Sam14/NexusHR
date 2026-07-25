package com.nexushr.repository;

import com.nexushr.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByActive(boolean active);

    boolean existsByName(String name);

    Optional<Department> findByName(String name);

}
