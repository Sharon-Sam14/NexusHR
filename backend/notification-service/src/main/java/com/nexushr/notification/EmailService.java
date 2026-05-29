package com.nexushr.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/*
 * EmailService
 *
 * Simulated SMTP JavaMailSender wrapper for NexusHR.
 *
 * In a production environment, this would use Spring Boot's JavaMailSender
 * to dispatch real emails. In this simulation, it logs a structured SMTP
 * mail header and body to the server console, demonstrating the dispatch lifecycle.
 *
 * Console output mimics real SMTP headers for demonstration purposes.
 */
@Service
@Slf4j
public class EmailService {

    private static final String FROM_ADDRESS = "noreply@nexushr.com";
    private static final String SMTP_HOST    = "smtp.nexushr.com";
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss +0530");

    public record EmailResult(boolean success, String to, String subject, String messageId) {}

    /*
     * Simulates sending a plain-text email notification.
     *
     * @param to      Recipient email address
     * @param subject Email subject line
     * @param body    Email body content
     */
    public EmailResult send(String to, String subject, String body) {
        String messageId = generateMessageId();
        String timestamp = LocalDateTime.now().format(FMT);

        log.info("\n╔══════════════════════════════════════════════════════════════════════");
        log.info("║  [SMTP] ✉ EMAIL DISPATCHED — NexusHR Mail Gateway");
        log.info("╠══════════════════════════════════════════════════════════════════════");
        log.info("║  Message-ID : <{}>", messageId);
        log.info("║  Date       : {}", timestamp);
        log.info("║  From       : NexusHR System <{}>", FROM_ADDRESS);
        log.info("║  To         : {}", to);
        log.info("║  Subject    : {}", subject);
        log.info("║  SMTP Host  : {}", SMTP_HOST);
        log.info("╠══════════════════════════════════════════════════════════════════════");
        log.info("║  BODY:");
        log.info("║  {}", body.replace("\n", "\n║  "));
        log.info("╚══════════════════════════════════════════════════════════════════════");
        log.info("[SMTP] Status: 250 OK | Message accepted for delivery to {}", to);

        return new EmailResult(true, to, subject, messageId);
    }

    /*
     * Sends a leave approval/rejection notification email.
     */
    public EmailResult sendLeaveStatusEmail(String to, String employeeName,
                                             String leaveType, String status, String approvedBy) {
        String subject = "[NexusHR] Leave " + capitalise(status) + " — " + leaveType + " Leave";
        String body = "Dear " + employeeName + ",\n\n" +
                      "Your " + leaveType + " leave request has been " + status.toLowerCase() + " by " + approvedBy + ".\n\n" +
                      "Please log in to NexusHR to view your updated leave balance and request details.\n\n" +
                      "Best regards,\nNexusHR HR Team";
        return send(to, subject, body);
    }

    /*
     * Sends a payroll processed email.
     */
    public EmailResult sendPayrollEmail(String to, String employeeName, String period, double netSalary) {
        String subject = "[NexusHR] Payslip Available — " + period;
        String body = "Dear " + employeeName + ",\n\n" +
                      "Your payslip for " + period + " has been processed. Net salary: $" +
                      String.format("%,.2f", netSalary) + ".\n\n" +
                      "Log in to NexusHR to view and download your payslip.\n\n" +
                      "Best regards,\nNexusHR Payroll Team";
        return send(to, subject, body);
    }

    private String generateMessageId() {
        return Long.toHexString(System.currentTimeMillis()) + "." +
               Integer.toHexString((int)(Math.random() * 0xFFFF)) + "@nexushr.com";
    }

    private String capitalise(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }
}
