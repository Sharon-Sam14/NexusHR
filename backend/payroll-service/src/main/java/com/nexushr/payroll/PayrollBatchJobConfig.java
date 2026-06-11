package com.nexushr.payroll;

import com.nexushr.entity.Attendance;
import com.nexushr.entity.Employee;
import com.nexushr.entity.Payroll;
import com.nexushr.entity.PayrollStatus;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

/*
 * PayrollBatchJobConfig
 *
 * Simulated asynchronous batch payroll processing engine.
 *
 * Triggered by HR to generate all monthly payroll records in bulk.
 * Each employee's payroll is computed via PayrollCalculator, then
 * persisted. Skips employees who already have a payroll entry for the period.
 *
 * The @Async annotation ensures the batch runs in the background without
 * blocking the HTTP request thread, mimicking a real Spring Batch job.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@EnableAsync
@SuppressWarnings("null")
public class PayrollBatchJobConfig {

    private final EmployeeRepository employeeRepository;
    private final PayrollRepository payrollRepository;
    private final PayrollCalculator payrollCalculator;
    private final AttendanceRepository attendanceRepository;

    /*
     * Result summary for the batch job execution.
     */
    public record BatchResult(
            int month,
            int year,
            int processed,
            int skipped,
            int failed,
            long durationMs,
            String status
    ) {}

    /*
     * Runs a monthly payroll batch for all active employees.
     * @param month  Month number (1–12)
     * @param year   Calendar year
     * @param bonus       Default bonus per employee
     * @param deductions  Default deductions per employee
     */
    @Async
    public CompletableFuture<BatchResult> runMonthlyBatch(int month, int year, double bonus, double deductions) {
        long startMs = System.currentTimeMillis();
        log.info("[PAYROLL-BATCH] Starting batch job for {}/{}", month, year);

        List<Employee> employees = employeeRepository.findAll();
        AtomicInteger processed = new AtomicInteger(0);
        AtomicInteger skipped = new AtomicInteger(0);
        AtomicInteger failed = new AtomicInteger(0);

        for (Employee emp : employees) {
            try {
                // Skip if payroll already exists for this period
                boolean exists = payrollRepository.existsByEmployeeIdAndMonthAndYear(emp.getId(), month, year);
                if (exists) {
                    log.debug("[PAYROLL-BATCH] Skipping {} — payroll already exists for {}/{}", emp.getEmployeeName(), month, year);
                    skipped.incrementAndGet();
                    continue;
                }

                // Calculate overtime hours from attendance logs
                double overtimeHours = 0.0;
                List<Attendance> attendances = attendanceRepository.findByEmployeeId(emp.getId());
                if (attendances != null) {
                    for (Attendance att : attendances) {
                        if (att.getDate() != null && att.getDate().getMonthValue() == month && att.getDate().getYear() == year) {
                            if (att.getWorkHours() != null && att.getWorkHours() > 9.0) {
                                overtimeHours += (att.getWorkHours() - 9.0);
                            }
                        }
                    }
                }

                // Determine attendance days (default values for batch)
                int workingDays = LocalDate.of(year, month, 1).lengthOfMonth() <= 28 ? 20 : 22;
                double hourlyRate = emp.getSalary() / (workingDays * 9.0);

                // Calculate payroll
                PayrollCalculator.PayrollResult result = payrollCalculator.calculate(
                        emp.getSalary(), bonus, deductions, overtimeHours, hourlyRate
                );

                Payroll payroll = Payroll.builder()
                        .employee(emp)
                        .month(month)
                        .year(year)
                        .basicSalary(result.basicSalary())
                        .bonus(result.bonus())
                        .deductions(result.deductions())
                        .tax(result.taxAmount())
                        .overtimeHours(result.overtimeHours())
                        .overtimePay(result.overtimePay())
                        .netSalary(result.netSalary())
                        .status(PayrollStatus.PENDING)
                        .workingDays(workingDays)
                        .daysPresent(workingDays)
                        .remarks("Batch auto-generated for " + month + "/" + year + " | Tax: " + result.taxBracketLabel())
                        .build();

                payrollRepository.save(payroll);
                processed.incrementAndGet();
                log.info("[PAYROLL-BATCH] Processed {} → net={}", emp.getEmployeeName(), result.netSalary());

            } catch (Exception e) {
                failed.incrementAndGet();
                log.error("[PAYROLL-BATCH] Failed for employee {}: {}", emp.getEmployeeName(), e.getMessage());
            }
        }

        long duration = System.currentTimeMillis() - startMs;
        log.info("[PAYROLL-BATCH] Complete — processed={}, skipped={}, failed={}, duration={}ms",
                processed.get(), skipped.get(), failed.get(), duration);

        return CompletableFuture.completedFuture(new BatchResult(
                month, year,
                processed.get(), skipped.get(), failed.get(),
                duration, "COMPLETED"
        ));
    }
}
