package com.nexushr.repository;

import com.nexushr.entity.EmployeeBiometric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeBiometricRepository extends JpaRepository<EmployeeBiometric, Long> {
    List<EmployeeBiometric> findByEmployeeId(Long employeeId);
    Optional<EmployeeBiometric> findByEmployeeIdAndBiometricType(Long employeeId, String biometricType);
    Optional<EmployeeBiometric> findByCardId(String cardId);
    List<EmployeeBiometric> findByEnabled(boolean enabled);
}
