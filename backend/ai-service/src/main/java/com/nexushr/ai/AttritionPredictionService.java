package com.nexushr.ai;

import com.nexushr.entity.Attendance;
import com.nexushr.entity.AttendanceStatus;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Performance;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;

/*
 * AttritionPredictionService
 *
 * Computes a probabilistic attrition risk score for each employee
 * based on a multi-factor model: salary benchmarking, attendance patterns,
 * late arrival rate, performance ratings, and tenure stagnation.
 *
 * Risk levels: LOW (< 30%), MEDIUM (30–59%), HIGH (>= 60%)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AttritionPredictionService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PerformanceRepository performanceRepository;

    public record AttritionResult(
            Long employeeId,
            String employeeName,
            String department,
            double riskScore,
            String riskLevel,
            List<String> reasons,
            List<String> recommendations
    ) {}

    /*
     * Runs attrition analysis across all employees.
     */
    public List<AttritionResult> predictAll() {
        List<Employee> employees = employeeRepository.findAll();
        double avgSalary = employees.stream().mapToDouble(Employee::getSalary).average().orElse(0.0);
        List<AttritionResult> results = new ArrayList<>();
        for (Employee emp : employees) {
            results.add(predict(emp, avgSalary));
        }
        return results;
    }

    /*
     * Runs attrition analysis for a single employee.
     */
    public AttritionResult predictForEmployee(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        double avgSalary = employeeRepository.findAll().stream()
                .mapToDouble(Employee::getSalary).average().orElse(0.0);
        return predict(emp, avgSalary);
    }

    private AttritionResult predict(Employee emp, double avgSalary) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeId(emp.getId());
        List<Performance> reviews = performanceRepository.findByEmployeeId(emp.getId());

        double riskScore = 10.0; // base risk
        List<String> reasons = new ArrayList<>();
        List<String> recs = new ArrayList<>();

        // Factor 1: Attendance rate
        double attendanceRate = 100.0;
        double lateRate = 0.0;
        if (!attendances.isEmpty()) {
            long present = attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE)
                    .count();
            long late = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
            attendanceRate = (double) present / attendances.size() * 100.0;
            lateRate = present > 0 ? (double) late / present * 100.0 : 0.0;
        }

        if (attendanceRate < 85.0) {
            riskScore += 15.0;
            reasons.add(String.format("Low attendance rate (%.1f%%)", attendanceRate));
            recs.add("Initiate an HR wellness check-in with " + emp.getEmployeeName());
        }
        if (lateRate > 20.0) {
            riskScore += 10.0;
            reasons.add(String.format("High late arrival rate (%.1f%%)", lateRate));
            recs.add("Discuss flexible working hours to improve punctuality");
        }

        // Factor 2: Salary benchmark
        if (emp.getSalary() < avgSalary * 0.85) {
            riskScore += 20.0;
            reasons.add(String.format("Salary ($%,.0f) is below company average ($%,.0f)", emp.getSalary(), avgSalary));
            recs.add("Schedule a compensation review for " + emp.getEmployeeName());
        }

        // Factor 3: High performer, undercompensated
        OptionalDouble latestRating = reviews.stream().mapToDouble(Performance::getOverallRating).max();
        double performanceRating = latestRating.orElse(3.0);
        if (performanceRating >= 4.2 && emp.getSalary() < 85_000) {
            riskScore += 25.0;
            reasons.add("High performer (" + performanceRating + "/5) with below-market compensation");
            recs.add("Propose a retention bonus or salary raise for " + emp.getEmployeeName());
        }

        // Factor 4: Tenure stagnation
        if (emp.getJoiningDate() != null) {
            long months = ChronoUnit.MONTHS.between(emp.getJoiningDate(), LocalDate.now());
            if (months > 24 && reviews.isEmpty()) {
                riskScore += 10.0;
                reasons.add("2+ years of tenure with no performance review records");
                recs.add("Initiate a formal performance review cycle for " + emp.getEmployeeName());
            }
        }

        riskScore = Math.max(5.0, Math.min(95.0, riskScore));
        String riskLevel = riskScore >= 60.0 ? "HIGH" : riskScore >= 30.0 ? "MEDIUM" : "LOW";

        if (reasons.isEmpty()) {
            reasons.add("Stable attendance, market-aligned salary, strong performance records");
            recs.add("Continue regular recognition and growth conversations");
        }

        log.info("[ATTRITION] {} → {}% ({})", emp.getEmployeeName(), riskScore, riskLevel);

        return new AttritionResult(emp.getId(), emp.getEmployeeName(), emp.getDepartment(),
                riskScore, riskLevel, reasons, recs);
    }
}
