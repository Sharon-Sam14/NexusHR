package com.nexushr.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * HealthController — Dedicated health check endpoint for Render.
 *
 * Exposes GET /api/health returning HTTP 200 to signal that the Spring container
 * has boot-strapped successfully.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "NexusHR",
                "timestamp", java.time.Instant.now().toString(),
                "version", "0.0.1-SNAPSHOT"
        ));
    }
}
