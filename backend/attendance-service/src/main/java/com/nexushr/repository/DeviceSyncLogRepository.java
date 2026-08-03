package com.nexushr.repository;

import com.nexushr.entity.DeviceSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeviceSyncLogRepository extends JpaRepository<DeviceSyncLog, Long> {
    List<DeviceSyncLog> findByDeviceId(String deviceId);
    List<DeviceSyncLog> findByStatus(String status);
    void deleteBySyncTimeBefore(LocalDateTime time);
}
