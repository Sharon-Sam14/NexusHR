package com.nexushr.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Biometric machine attendance punches.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BiometricAttendanceDTO {
    private Long employeeId;
    private String deviceId;
    private LocalDateTime timestamp;
    private String type; // CHECK_IN or CHECK_OUT
}
