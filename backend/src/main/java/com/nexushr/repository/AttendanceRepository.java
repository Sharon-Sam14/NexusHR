package com.nexushr.repository;

import com.nexushr.entity.Attendance;
import com.nexushr.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    Optional<Attendance> findFirstByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end);

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

}