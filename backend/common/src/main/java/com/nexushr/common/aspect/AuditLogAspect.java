package com.nexushr.common.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/*
 * AuditLogAspect
 *
 * Cross-cutting AOP concern that intercepts all Service and Repository method calls.
 * Logs execution time, caller identity, and method outcomes for audit trail purposes.
 */
@Aspect
@Component
@Slf4j
public class AuditLogAspect {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /*
     * Intercepts all service layer methods for performance + audit logging.
     */
    @Around("execution(* com.nexushr.*.service..*(..))")
    public Object auditServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        return auditExecution(joinPoint, "SERVICE");
    }

    /*
     * Intercepts all repository layer methods.
     */
    @Around("execution(* com.nexushr.*.repository..*(..))")
    public Object auditRepositoryExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        return auditExecution(joinPoint, "REPOSITORY");
    }

    /*
     * Core audit execution with timing and identity resolution.
     */
    private Object auditExecution(ProceedingJoinPoint joinPoint, String layer) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String actor = resolveCurrentActor();
        long startMs = System.currentTimeMillis();

        log.info("[AUDIT][{}] {} {} | actor={} | ts={}",
                layer, className, methodName, actor,
                LocalDateTime.now().format(FORMATTER));

        try {
            Object result = joinPoint.proceed();
            long durationMs = System.currentTimeMillis() - startMs;
            log.info("[AUDIT][{}] {} {} | status=SUCCESS | duration={}ms",
                    layer, className, methodName, durationMs);
            return result;
        } catch (Throwable ex) {
            long durationMs = System.currentTimeMillis() - startMs;
            log.warn("[AUDIT][{}] {} {} | status=FAILURE | error={} | duration={}ms",
                    layer, className, methodName, ex.getMessage(), durationMs);
            throw ex;
        }
    }

    /*
     * Extracts the email of the authenticated user, falling back to "anonymous".
     */
    private String resolveCurrentActor() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "anonymous";
    }
}
