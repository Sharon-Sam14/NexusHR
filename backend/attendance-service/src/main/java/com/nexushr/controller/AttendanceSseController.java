package com.nexushr.controller;

import com.nexushr.service.AttendanceEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/*
 * AttendanceSseController
 *
 * Exposes:
 *   GET /api/attendance/stream/{subscriberKey}  — SSE stream for live attendance punch events
 *
 * Frontend connects once; the server pushes `attendance-punch` events in real-time
 * whenever any employee checks in or out via AttendanceEventPublisher.
 */
@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AttendanceSseController {

    private final AttendanceEventPublisher attendanceEventPublisher;

    /*
     * Opens a persistent SSE connection for a subscriber (identified by email or session key).
     * Returns a text/event-stream response that the frontend EventSource can consume.
     *
     * Example: GET /api/attendance/stream/hr@nexushr.com
     */
    @GetMapping(value = "/stream/{subscriberKey}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public SseEmitter streamAttendanceEvents(@PathVariable String subscriberKey) {
        return attendanceEventPublisher.subscribe(subscriberKey);
    }
}
