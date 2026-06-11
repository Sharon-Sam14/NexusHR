package com.nexushr.controller;

import com.nexushr.ai.AttritionPredictionService;
import com.nexushr.ai.HRChatbotService;
import com.nexushr.ai.SkillGapAnalyser;
import com.nexushr.dto.AiInsightsDTO;
import com.nexushr.service.AiInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/*
 * AiInsightsController
 *
 * Exposes:
 *   GET  /api/ai/insights              — general AI insights dashboard data
 *   GET  /api/ai/attrition             — attrition risk scores for all employees
 *   GET  /api/ai/attrition/{id}        — attrition risk for one employee
 *   GET  /api/ai/skill-gaps            — skill gap analysis across all employees
 *   GET  /api/ai/skill-gaps/{id}       — skill gaps for one employee
 *   POST /api/ai/chat                  — HR co-pilot chatbot query
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiInsightsController {

    private final AiInsightsService aiInsightsService;
    private final AttritionPredictionService attritionPredictionService;
    private final SkillGapAnalyser skillGapAnalyser;
    private final HRChatbotService hrChatbotService;

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AiInsightsDTO> getInsights() {
        return ResponseEntity.ok(aiInsightsService.getInsights());
    }

    /*
     * Returns attrition risk prediction for all employees.
     */
    @GetMapping("/attrition")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttritionPredictionService.AttritionResult>> getAllAttrition() {
        return ResponseEntity.ok(attritionPredictionService.predictAll());
    }

    /*
     * Returns attrition risk for a single employee.
     */
    @GetMapping("/attrition/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#id)")
    public ResponseEntity<AttritionPredictionService.AttritionResult> getEmployeeAttrition(@PathVariable Long id) {
        return ResponseEntity.ok(attritionPredictionService.predictForEmployee(id));
    }

    /*
     * Returns skill gap analysis across all employees.
     */
    @GetMapping("/skill-gaps")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<SkillGapAnalyser.SkillGap>> getAllSkillGaps() {
        return ResponseEntity.ok(skillGapAnalyser.analyseAll());
    }

    /*
     * Returns skill gaps for a single employee.
     */
    @GetMapping("/skill-gaps/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#id)")
    public ResponseEntity<List<SkillGapAnalyser.SkillGap>> getEmployeeSkillGaps(@PathVariable Long id) {
        return ResponseEntity.ok(skillGapAnalyser.analyseForEmployee(id));
    }

    /*
     * HR Co-pilot chatbot endpoint.
     * Body: { "query": "How many employees are at risk?" }
     */
    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HRChatbotService.ChatResponse> chat(@RequestBody Map<String, String> body) {
        String query = body.getOrDefault("query", "");
        if (query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(hrChatbotService.query(query));
    }
}
