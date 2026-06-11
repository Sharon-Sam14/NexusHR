package com.nexushr.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/*
 * SmsService
 *
 * Simulated Twilio SMS wrapper for NexusHR.
 *
 * In production, this would use the Twilio REST API client to dispatch
 * real SMS messages. This simulation logs a structured Twilio-style
 * message payload to the server console for demonstration.
 */
@Service
@Slf4j
public class SmsService {

    private static final String FROM_NUMBER = "+1 (555) NEXUSHR";
    private static final String ACCOUNT_SID = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Demo SID
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public record SmsResult(boolean success, String to, String messageSid, String status) {}

    /*
     * Simulates sending an SMS via Twilio.
     *
     * @param toPhone  Recipient phone number
     * @param message  SMS body (max 160 chars recommended)
     */
    public SmsResult send(String toPhone, String message) {
        String sid = "SM" + Long.toHexString(System.currentTimeMillis()).toUpperCase();
        String timestamp = LocalDateTime.now().format(FMT);

        log.info("\n┌──────────────────────────────────────────────────────────────────────");
        log.info("│  [TWILIO] 📱 SMS DISPATCHED — NexusHR Notification Gateway");
        log.info("├──────────────────────────────────────────────────────────────────────");
        log.info("│  Account SID  : {}", ACCOUNT_SID);
        log.info("│  Message SID  : {}", sid);
        log.info("│  From         : {}", FROM_NUMBER);
        log.info("│  To           : {}", toPhone);
        log.info("│  Date Sent    : {}", timestamp);
        log.info("│  Status       : queued → sent");
        log.info("├──────────────────────────────────────────────────────────────────────");
        log.info("│  BODY: {}", message);
        log.info("└──────────────────────────────────────────────────────────────────────");
        log.info("[TWILIO] Delivery receipt: delivered to {}", toPhone);

        return new SmsResult(true, toPhone, sid, "delivered");
    }

    /*
     * Sends a leave decision SMS.
     */
    public SmsResult sendLeaveDecisionSms(String toPhone, String employeeName, String status) {
        String msg = "NexusHR: Hi " + employeeName + ", your leave request has been " +
                     status.toLowerCase() + ". Log in to NexusHR for details.";
        return send(toPhone, msg);
    }

    /*
     * Sends a payroll processed SMS.
     */
    public SmsResult sendPayrollSms(String toPhone, String employeeName, double netSalary) {
        String msg = "NexusHR: Hi " + employeeName + ", your payslip is ready. Net pay: $" +
                     String.format("%,.2f", netSalary) + ". Login to download.";
        return send(toPhone, msg);
    }
}
