package com.nexushr.repository;

import com.nexushr.entity.ShiftConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ShiftConfigurationRepository extends JpaRepository<ShiftConfiguration, Long> {
    Optional<ShiftConfiguration> findByShiftName(String shiftName);
}
