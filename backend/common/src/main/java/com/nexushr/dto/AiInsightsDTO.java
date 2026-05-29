package com.nexushr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsightsDTO {

    private List<AttritionRisk> attritionRisks;
    private List<SkillGap> skillGaps;
    private List<EngagementScore> engagementScores;
    private List<String> aiRecommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttritionRisk {
        private Long employeeId;
        private String employeeName;
        private String riskLevel; // LOW, MEDIUM, HIGH
        private Double riskPercentage;
        private List<String> reasons;
        private List<String> recommendations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillGap {
        private String departmentName;
        private String skillName;
        private Integer requiredLevel; // 1-5
        private Integer currentLevel;  // 1-5
        private Double gapPercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EngagementScore {
        private Long employeeId;
        private String employeeName;
        private Double score; // 0-100
        private Double attendanceRate; // 0-100
        private Double performanceRating; // 0-5
    }
}
