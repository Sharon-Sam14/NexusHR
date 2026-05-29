package com.nexushr.payroll;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/*
 * PayrollCalculator
 *
 * Core calculation engine for NexusHR payroll processing.
 *
 * Tax Brackets (on basic salary):
 *   - Basic < 50,000  → 12%
 *   - Basic < 100,000 → 18%
 *   - Basic >= 100,000 → 25%
 */
@Component
@Slf4j
public class PayrollCalculator {

    /*
     * Immutable result record for a single payroll computation.
     */
    public record PayrollResult(
            double basicSalary,
            double bonus,
            double deductions,
            double taxRate,
            double taxAmount,
            double netSalary,
            String taxBracketLabel,
            double overtimeHours,
            double overtimePay
    ) {
        public PayrollResult(double basicSalary, double bonus, double deductions, double taxRate, double taxAmount, double netSalary, String taxBracketLabel) {
            this(basicSalary, bonus, deductions, taxRate, taxAmount, netSalary, taxBracketLabel, 0.0, 0.0);
        }
    }

    /*
     * Computes a full payroll breakdown for the given salary inputs.
     *
     * @param basicSalary Monthly base salary
     * @param bonus       Additional incentive amount
     * @param deductions  Fixed deductions (insurance, PF, etc.)
     * @return            Fully computed PayrollResult
     */
    public PayrollResult calculate(double basicSalary, double bonus, double deductions) {
        return calculate(basicSalary, bonus, deductions, 0.0, 0.0);
    }

    /*
     * Computes a full payroll breakdown including overtime metrics.
     */
    public PayrollResult calculate(double basicSalary, double bonus, double deductions, double overtimeHours, double hourlyRate) {
        double taxRate = resolveTaxRate(basicSalary);
        double taxAmount = basicSalary * taxRate;
        double overtimePay = Math.round((overtimeHours * hourlyRate * 1.5) * 100.0) / 100.0;
        double netSalary = basicSalary + bonus + overtimePay - deductions - taxAmount;

        String label = resolveBracketLabel(taxRate);

        log.info("[PAYROLL-CALC] basic={} bonus={} overtimeHours={} overtimePay={} deductions={} tax={}({}) net={}",
                basicSalary, bonus, overtimeHours, overtimePay, deductions, taxAmount, label, netSalary);

        return new PayrollResult(basicSalary, bonus, deductions, taxRate, taxAmount, netSalary, label, overtimeHours, overtimePay);
    }

    /*
     * Computes tax-only for a given salary (used in preview modes).
     */
    public double computeTax(double basicSalary) {
        return basicSalary * resolveTaxRate(basicSalary);
    }

    /*
     * Returns the applicable annual tax rate as a decimal fraction.
     */
    private double resolveTaxRate(double basicSalary) {
        if (basicSalary < 50_000) {
            return 0.12;
        } else if (basicSalary < 100_000) {
            return 0.18;
        } else {
            return 0.25;
        }
    }

    private String resolveBracketLabel(double rate) {
        if (rate == 0.12) return "12% (Low)";
        if (rate == 0.18) return "18% (Mid)";
        return "25% (High)";
    }
}
