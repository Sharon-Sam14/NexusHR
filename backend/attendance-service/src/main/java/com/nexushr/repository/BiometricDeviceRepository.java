package com.nexushr.repository;

import com.nexushr.entity.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, Long> {
    Optional<BiometricDevice> findByDeviceId(String deviceId);
    Optional<BiometricDevice> findByIpAddressAndPort(String ipAddress, Integer port);
}
