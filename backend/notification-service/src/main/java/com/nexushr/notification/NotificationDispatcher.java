package com.nexushr.notification;

import com.nexushr.entity.Notification;
import com.nexushr.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/*
 * NotificationDispatcher
 *
 * Central orchestrator for all outgoing notifications in NexusHR.
 *
 * On each event trigger, the dispatcher:
 *   1. Persists an in-app Notification record to the database.
 *   2. Calls EmailService to simulate SMTP dispatch.
 *   3. Calls SmsService (if phone provided) to simulate Twilio SMS dispatch.
 *
 * This ensures all communication channels are triggered atomically
 * from a single call point.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@SuppressWarnings("null")
public class NotificationDispatcher {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    /*
     * Dispatch payload encapsulating all notification details.
     */
    public record DispatchPayload(
            String userEmail,
            String title,
            String message,
            String type,
            String actionUrl,
            String toPhone        // nullable — SMS only if provided
    ) {}

    /*
     * Dispatches a notification across all available channels.
     */
    public void dispatch(DispatchPayload payload) {
        log.info("[DISPATCH] Sending notification type={} to {}", payload.type(), payload.userEmail());

        // 1. Persist in-app notification
        Notification notif = Notification.builder()
                .userEmail(payload.userEmail())
                .title(payload.title())
                .message(payload.message())
                .type(payload.type())
                .read(false)
                .createdAt(LocalDateTime.now())
                .actionUrl(payload.actionUrl())
                .build();
        notificationRepository.save(notif);
        log.info("[DISPATCH] In-app notification persisted (id={})", notif.getId());

        // 2. Email dispatch simulation
        emailService.send(
                payload.userEmail(),
                "[NexusHR] " + payload.title(),
                payload.message()
        );

        // 3. SMS dispatch simulation (only when phone is available)
        if (payload.toPhone() != null && !payload.toPhone().isBlank()) {
            smsService.send(payload.toPhone(), payload.title() + ": " + payload.message());
        } else {
            log.debug("[DISPATCH] SMS skipped — no phone number provided for {}", payload.userEmail());
        }
    }

    /*
     * Convenience method for leave status notifications.
     */
    public void dispatchLeaveUpdate(String userEmail, String employeeName,
                                     String leaveType, String status, String toPhone) {
        String title = "Leave " + capitalise(status) + " — " + leaveType;
        String message = "Dear " + employeeName + ", your " + leaveType +
                         " leave request has been " + status.toLowerCase() + ".";

        dispatch(new DispatchPayload(userEmail, title, message, "LEAVE", "/leaves", toPhone));
    }

    /*
     * Convenience method for payroll notifications.
     */
    public void dispatchPayrollReady(String userEmail, String employeeName,
                                      String period, double netSalary, String toPhone) {
        String title   = "Payslip Ready — " + period;
        String message = "Dear " + employeeName + ", your payslip for " + period +
                         " is now available. Net pay: $" + String.format("%,.2f", netSalary) + ".";

        dispatch(new DispatchPayload(userEmail, title, message, "PAYROLL", "/payroll", toPhone));
    }

    /*
     * Convenience method for performance review notifications.
     */
    public void dispatchReviewSubmitted(String userEmail, String employeeName, String period) {
        String title   = "Performance Review Submitted — " + period;
        String message = "Dear " + employeeName + ", your manager has submitted your performance " +
                         "review for " + period + ". Please log in to review and acknowledge.";

        dispatch(new DispatchPayload(userEmail, title, message, "PERFORMANCE", "/performance", null));
    }

    private String capitalise(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }
}
