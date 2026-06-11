package com.nexushr.controller;

import com.nexushr.entity.Payroll;
import com.nexushr.payroll.PayrollBatchJobConfig;
import com.nexushr.payroll.PayslipGenerator;
import com.nexushr.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/*
 * PayrollBatchController
 *
 * Exposes:
 *   POST /api/payroll/batch/run     — async bulk payroll generation for a month/year
 *   GET  /api/payroll/{id}/pdf      — download a PDF payslip for a given payroll record
 */
@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PayrollBatchController {

    private final PayrollBatchJobConfig batchJobConfig;
    private final PayslipGenerator payslipGenerator;
    private final PayrollRepository payrollRepository;

    /*
     * Triggers an asynchronous batch payroll run for all employees.
     *
     * Body (all optional, have defaults):
     * {
     *   "month":      5,
     *   "year":       2026,
     *   "bonus":      5000.0,
     *   "deductions": 2000.0
     * }
     */
    @PostMapping("/batch/run")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> runBatch(@RequestBody Map<String, Object> body) {
        int month      = body.containsKey("month")      ? ((Number) body.get("month")).intValue()      : java.time.LocalDate.now().getMonthValue();
        int year       = body.containsKey("year")       ? ((Number) body.get("year")).intValue()       : java.time.LocalDate.now().getYear();
        double bonus      = body.containsKey("bonus")      ? ((Number) body.get("bonus")).doubleValue()      : 0.0;
        double deductions = body.containsKey("deductions") ? ((Number) body.get("deductions")).doubleValue() : 0.0;

        batchJobConfig.runMonthlyBatch(month, year, bonus, deductions);

        // Return immediately — batch runs asynchronously in the background
        return ResponseEntity.accepted().body(Map.of(
                "message", "Payroll batch job started for " + month + "/" + year,
                "month", month,
                "year", year,
                "status", "RUNNING"
        ));
    }

    /*
     * Downloads a PDF payslip for a given payroll record ID.
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isPayrollOwner(#id)")
    public ResponseEntity<byte[]> downloadPdfPayslip(@PathVariable Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll record not found: " + id));

        byte[] pdfBytes = payslipGenerator.generate(payroll);

        String filename = "payslip_" + payroll.getEmployee().getEmployeeName().replaceAll("\\s+", "_")
                          + "_" + payroll.getMonth() + "_" + payroll.getYear() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
