package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "shift_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String shiftName;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Builder.Default
    private Double halfDayThresholdHours = 4.0;

    @Builder.Default
    private Double fullDayHours = 8.0;

    @Builder.Default
    private Integer graceTimeMinutes = 15;

    @Builder.Default
    private boolean isNightShift = false;
}
