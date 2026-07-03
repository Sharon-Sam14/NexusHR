package com.nexushr.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Slf4j
public class AuditLogger {

    private static final RestTemplate restTemplate = new RestTemplate();
    private static final String AUDIT_LOG_URL = "http://localhost:8081/api/audit-logs";

    public static void log(String actor, String action, String target, String details) {
        try {
            Map<String, String> payload = Map.of(
                "actor", actor != null ? actor : "SYSTEM",
                "action", action != null ? action : "UNKNOWN",
                "target", target != null ? target : "UNKNOWN",
                "details", details != null ? details : ""
            );
            restTemplate.postForObject(AUDIT_LOG_URL, payload, Void.class);
            log.info("[AUDIT-LOG] actor={} action={} target={}", actor, action, target);
        } catch (Exception e) {
            log.error("[AUDIT-LOG-FAILED] Failed to send audit log: {}", e.getMessage());
        }
    }

    public static String getCurrentUserEmail() {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Spring Security might not be initialized in this thread
        }
        return "SYSTEM";
    }
}
