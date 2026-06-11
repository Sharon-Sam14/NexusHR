package com.nexushr.service;

import com.nexushr.entity.Attendance;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/*
 * AttendanceEventPublisher
 *
 * Publishes real-time attendance punch events via:
 *   1. Spring's ApplicationEventPublisher (internal event bus).
 *   2. Server-Sent Events (SSE) stream for the frontend live dashboard.
 *
 * The SSE emitter map is keyed by session identifier (employee email).
 */
@Service
@Slf4j
public class AttendanceEventPublisher {

    private final ApplicationEventPublisher springEventBus;

    /* Active SSE subscriptions keyed by user email */
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public AttendanceEventPublisher(ApplicationEventPublisher springEventBus) {
        this.springEventBus = springEventBus;
    }

    /*
     * Payload record published on each attendance punch event.
     */
    public record AttendancePunchEvent(
            Long employeeId,
            String employeeName,
            String email,
            String type,      // "CHECK_IN" | "CHECK_OUT"
            LocalTime time,
            String status
    ) {}

    /*
     * Publish a check-in or check-out event.
     * Notifies the Spring event bus and pushes to all active SSE subscribers.
     */
    public void publishPunch(Attendance attendance, String punchType) {
        AttendancePunchEvent event = new AttendancePunchEvent(
                attendance.getEmployee().getId(),
                attendance.getEmployee().getEmployeeName(),
                attendance.getEmployee().getEmail(),
                punchType,
                punchType.equals("CHECK_IN") ? attendance.getCheckIn() : attendance.getCheckOut(),
                attendance.getStatus().name()
        );

        // 1. Publish to Spring event bus
        springEventBus.publishEvent(event);
        log.info("[SSE] Attendance punch published: {} for {} at {}",
                punchType, event.employeeName(), event.time());

        // 2. Push to active SSE emitters (broadcast to all HR dashboards)
        emitters.forEach((key, emitterList) -> {
            emitterList.removeIf(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name("attendance-punch")
                            .data(event));
                    return false;
                } catch (IOException e) {
                    log.warn("[SSE] Removing dead emitter for key={}", key);
                    return true;
                }
            });
        });
    }

    /*
     * Registers a new SSE emitter for the given subscriber key (e.g., email or session ID).
     * Returns the configured SseEmitter to be streamed back to the client.
     */
    public SseEmitter subscribe(String subscriberKey) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5-minute timeout
        emitters.computeIfAbsent(subscriberKey, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(subscriberKey, emitter));
        emitter.onTimeout(() -> removeEmitter(subscriberKey, emitter));
        emitter.onError(e -> removeEmitter(subscriberKey, emitter));

        log.info("[SSE] New subscriber registered: {}", subscriberKey);
        return emitter;
    }

    private void removeEmitter(String key, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(key);
        if (list != null) {
            list.remove(emitter);
        }
    }
}
