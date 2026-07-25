package com.nexushr.ai;

import com.nexushr.entity.Employee;
import com.nexushr.entity.Performance;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;

/*
 * SkillGapAnalyser
 *
 * Maps each employee's designation to a set of expected skills, then
 * estimates the proficiency gap based on performance rating as a proxy.
 *
 * Output is used in the AI Insights co-pilot panel for targeted training
 * recommendations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillGapAnalyser {

    private final EmployeeRepository employeeRepository;
    private final PerformanceRepository performanceRepository;

    public record SkillGap(
            Long employeeId,
            String employeeName,
            String department,
            String skillName,
            int requiredLevel,
            int currentLevel,
            double gapPercent,
            String trainingRecommendation
    ) {}

    /*
     * Analyses skill gaps across all employees.
     */
    public List<SkillGap> analyseAll() {
        List<SkillGap> gaps = new ArrayList<>();
        for (Employee emp : employeeRepository.findAll()) {
            gaps.addAll(analyseEmployee(emp));
        }
        return gaps;
    }

    /*
     * Analyses skill gaps for a single employee.
     */
    public List<SkillGap> analyseForEmployee(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
        return analyseEmployee(emp);
    }

    private List<SkillGap> analyseEmployee(Employee emp) {
        List<Performance> reviews = performanceRepository.findByEmployeeId(emp.getId());
        OptionalDouble ratingOpt = reviews.stream().mapToDouble(Performance::getOverallRating).max();
        double rating = ratingOpt.orElse(3.0);

        String designation = emp.getDesignation().toLowerCase();
        List<SkillGap> gaps = new ArrayList<>();

        if (designation.contains("engineer") || designation.contains("developer")) {
            gaps.add(buildGap(emp, "Cloud Infrastructure (AWS/GCP/K8s)", 5, rating >= 4.0 ? 4 : 3,
                    "Enroll in AWS Solutions Architect or GCP Professional Cloud Architect course"));
            gaps.add(buildGap(emp, "System Design & Microservices Architecture", 5, rating >= 4.5 ? 4 : 3,
                    "Study Designing Data-Intensive Applications; practice system design mock interviews"));
            gaps.add(buildGap(emp, "DevOps & CI/CD Pipelines", 4, rating >= 4.0 ? 3 : 2,
                    "Attend a hands-on DevOps bootcamp covering Docker, Jenkins, and GitHub Actions"));

        } else if (designation.contains("designer") || designation.contains("ui") || designation.contains("ux")) {
            gaps.add(buildGap(emp, "Figma Design Systems & Tokens", 5, rating >= 4.0 ? 5 : 4,
                    "Complete the Figma Advanced Design Systems course on Coursera"));
            gaps.add(buildGap(emp, "Usability Testing & UX Research", 4, rating >= 4.0 ? 3 : 2,
                    "Conduct at least 2 moderated user testing sessions per quarter"));

        } else if (designation.contains("analyst") || designation.contains("finance")) {
            gaps.add(buildGap(emp, "Advanced Financial Modeling (DCF, LBO)", 5, rating >= 4.0 ? 4 : 3,
                    "Enroll in CFI's Advanced Financial Modeling & Valuation course"));
            gaps.add(buildGap(emp, "BI & Data Visualization (Power BI / Tableau)", 4, 2,
                    "Complete a Tableau certification and apply to monthly financial report automation"));

        } else if (designation.contains("manager") || designation.contains("hr")) {
            gaps.add(buildGap(emp, "Strategic Talent Management & OKRs", 5, rating >= 4.0 ? 4 : 3,
                    "Pursue SHRM-CP certification and implement team OKR tracking this quarter"));
            gaps.add(buildGap(emp, "Data-Driven HR Analytics", 4, rating >= 4.0 ? 2 : 2,
                    "Learn People Analytics using LinkedIn Learning's HR Analytics path"));

        } else if (designation.contains("marketing") || designation.contains("lead")) {
            gaps.add(buildGap(emp, "Performance Marketing & A/B Testing", 5, rating >= 3.5 ? 3 : 2,
                    "Obtain Google Ads and Meta Blueprint certifications"));
            gaps.add(buildGap(emp, "SEO & Content Strategy", 4, rating >= 4.0 ? 3 : 2,
                    "Complete HubSpot Content Marketing certification and set monthly SEO KPIs"));
        }

        log.info("[SKILL-GAP] Analysed {} gaps for {} ({})", gaps.size(), emp.getEmployeeName(), emp.getDesignation());
        return gaps;
    }

    private SkillGap buildGap(Employee emp, String skill, int required, int current, String training) {
        double gap = ((double)(required - current) / required) * 100.0;
        return new SkillGap(
                emp.getId(), emp.getEmployeeName(), emp.getDepartment(),
                skill, required, current, Math.max(0, gap), training
        );
    }
}
