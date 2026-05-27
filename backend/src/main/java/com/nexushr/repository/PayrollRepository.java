package com.nexushr.repository;

import com.nexushr.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    List<Payroll> findByMonthAndYear(Integer month, Integer year);

    List<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM Payroll p WHERE p.month = :month AND p.year = :year")
    Double sumNetSalaryByMonthAndYear(Integer month, Integer year);

}