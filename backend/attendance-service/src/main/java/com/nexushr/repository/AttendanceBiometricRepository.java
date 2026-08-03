package com.nexushr.repository;

import com.nexushr.entity.AttendanceBiometric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceBiometricRepository extends JpaRepository<AttendanceBiometric, Long> {
    List<AttendanceBiometric> findByProcessed(boolean processed);
    List<AttendanceBiometric> findByEmployeeId(Long employeeId);
}
