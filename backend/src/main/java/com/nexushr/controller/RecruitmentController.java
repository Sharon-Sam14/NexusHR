package com.nexushr.controller;

import com.nexushr.dto.RecruitmentDTO;
import com.nexushr.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruitment")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    @GetMapping
    public ResponseEntity<List<RecruitmentDTO>> getAllPostings() {
        return ResponseEntity.ok(recruitmentService.getAllPostings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecruitmentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentService.getPostingById(id));
    }

    @PostMapping
    public ResponseEntity<RecruitmentDTO> createPosting(@RequestBody RecruitmentDTO dto) {
        return ResponseEntity.ok(recruitmentService.createPosting(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecruitmentDTO> updatePosting(@PathVariable Long id, @RequestBody RecruitmentDTO dto) {
        return ResponseEntity.ok(recruitmentService.updatePosting(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RecruitmentDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(recruitmentService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosting(@PathVariable Long id) {
        recruitmentService.deletePosting(id);
        return ResponseEntity.noContent().build();
    }

}
