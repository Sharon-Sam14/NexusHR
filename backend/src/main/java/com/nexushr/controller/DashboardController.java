package com.nexushr.controller;

import com.nexushr.dto.DashboardStatsDTO;
import com.nexushr.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(dashboardService.getStats(email));
    }

}
