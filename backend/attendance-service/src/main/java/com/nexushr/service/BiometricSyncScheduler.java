package com.nexushr.service;

import com.nexushr.dto.BiometricAttendanceDTO;
import com.nexushr.entity.AttendanceBiometric;
import com.nexushr.entity.BiometricDevice;
import com.nexushr.entity.DeviceSyncLog;
import com.nexushr.repository.AttendanceBiometricRepository;
import com.nexushr.repository.BiometricDeviceRepository;
import com.nexushr.repository.DeviceSyncLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BiometricSyncScheduler {

    private final BiometricDeviceRepository biometricDeviceRepository;
    private final AttendanceBiometricRepository attendanceBiometricRepository;
    private final DeviceSyncLogRepository deviceSyncLogRepository;
    private final BiometricDeviceService biometricDeviceService;
    private final BiometricAttendanceService biometricAttendanceService;

    /**
     * Heartbeat / Connection checks: runs every 30 seconds.
     */
    @Scheduled(fixedDelay = 30000)
    public void runDeviceHeartbeats() {
        log.info("[SCHEDULER] Running connection checks for all devices...");
        List<BiometricDevice> devices = biometricDeviceRepository.findAll();
        for (BiometricDevice device : devices) {
            try {
                biometricDeviceService.testConnection(device);
                biometricDeviceRepository.save(device);
            } catch (Exception e) {
                log.error("[SCHEDULER] Heartbeat failed for device: {}", device.getDeviceId(), e);
                device.setConnectionStatus("DISCONNECTED");
                device.setStatus("ERROR");
                biometricDeviceRepository.save(device);
            }
        }
    }

    /**
     * Syncs logs from connected active devices: runs every 60 seconds.
     */
    @Scheduled(fixedDelay = 60000)
    public void syncAttendanceLogs() {
        log.info("[SCHEDULER] Running biometric attendance logs synchronization...");
        List<BiometricDevice> devices = biometricDeviceRepository.findAll();

        for (BiometricDevice device : devices) {
            if ("ACTIVE".equals(device.getStatus()) && "CONNECTED".equals(device.getConnectionStatus())) {
                DeviceSyncLog.DeviceSyncLogBuilder logBuilder = DeviceSyncLog.builder()
                        .deviceId(device.getDeviceId())
                        .syncTime(LocalDateTime.now())
                        .recordsSynced(0);

                try {
                    List<AttendanceBiometric> fetched = biometricDeviceService.fetchAttendanceLogs(device);
                    if (!fetched.isEmpty()) {
                        List<AttendanceBiometric> savedRaw = attendanceBiometricRepository.saveAll(fetched);
                        logBuilder.recordsSynced(savedRaw.size());

                        // Process raw logs into standard attendance
                        int processedCount = 0;
                        for (AttendanceBiometric raw : savedRaw) {
                            try {
                                BiometricAttendanceDTO dto = BiometricAttendanceDTO.builder()
                                        .employeeId(raw.getEmployee().getId())
                                        .deviceId(raw.getDeviceId())
                                        .timestamp(raw.getPunchTime())
                                        .type(raw.getPunchType())
                                        .build();

                                biometricAttendanceService.processBiometricPunch(dto);
                                raw.setProcessed(true);
                                attendanceBiometricRepository.save(raw);
                                processedCount++;
                            } catch (Exception e) {
                                log.error("[SCHEDULER] Failed to process punch event for employee id={}", raw.getEmployee().getId(), e);
                            }
                        }
                        log.info("[SCHEDULER] Device {}: processed {}/{} logs.", device.getDeviceId(), processedCount, savedRaw.size());
                    }

                    device.setLastSyncTime(LocalDateTime.now());
                    biometricDeviceRepository.save(device);

                    deviceSyncLogRepository.save(logBuilder.status("SUCCESS").build());

                } catch (Exception e) {
                    log.error("[SCHEDULER] Sync failed for device: {}", device.getDeviceId(), e);
                    deviceSyncLogRepository.save(logBuilder.status("FAILED").errorMessage(e.getMessage()).build());
                }
            }
        }
    }

    /**
     * Purges old device sync logs (older than 30 days): runs daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void purgeOldLogs() {
        log.info("[SCHEDULER] Purging sync logs older than 30 days...");
        try {
            LocalDateTime threshold = LocalDateTime.now().minusDays(30);
            deviceSyncLogRepository.deleteBySyncTimeBefore(threshold);
            log.info("[SCHEDULER] Log purge completed successfully.");
        } catch (Exception e) {
            log.error("[SCHEDULER] Failed to purge old sync logs", e);
        }
    }
}
