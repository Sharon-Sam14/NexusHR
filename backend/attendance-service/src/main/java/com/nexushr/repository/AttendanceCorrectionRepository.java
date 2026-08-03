package com.nexushr.repository;

import com.nexushr.entity.AttendanceCorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceCorrectionRepository extends JpaRepository<AttendanceCorrection, Long> {
    List<AttendanceCorrection> findByEmployeeId(Long employeeId);
    List<AttendanceCorrection> findByStatus(String status);
}
