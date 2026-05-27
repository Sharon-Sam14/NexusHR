package com.nexushr.controller;

import com.nexushr.dto.AiInsightsDTO;
import com.nexushr.service.AiInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiInsightsController {

    private final AiInsightsService aiInsightsService;

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AiInsightsDTO> getInsights() {
        return ResponseEntity.ok(aiInsightsService.getInsights());
    }
}
