package com.nexushr.service.impl;

import com.nexushr.dto.RecruitmentDTO;
import com.nexushr.entity.Recruitment;
import com.nexushr.entity.RecruitmentStatus;
import com.nexushr.repository.RecruitmentRepository;
import com.nexushr.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RecruitmentServiceImpl implements RecruitmentService {

    private final RecruitmentRepository recruitmentRepository;

    @Override
    public RecruitmentDTO createPosting(RecruitmentDTO dto) {
        Recruitment r = toEntity(dto);
        r.setPostedDate(LocalDate.now());
        if (r.getStatus() == null) r.setStatus(RecruitmentStatus.OPEN);
        return toDTO(recruitmentRepository.save(r));
    }

    @Override
    public RecruitmentDTO updatePosting(Long id, RecruitmentDTO dto) {
        Recruitment existing = recruitmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
        existing.setJobTitle(dto.getJobTitle());
        existing.setDepartment(dto.getDepartment());
        existing.setJobDescription(dto.getJobDescription());
        existing.setRequirements(dto.getRequirements());
        existing.setLocation(dto.getLocation());
        existing.setJobType(dto.getJobType());
        existing.setSalaryMin(dto.getSalaryMin());
        existing.setSalaryMax(dto.getSalaryMax());
        existing.setClosingDate(dto.getClosingDate());
        existing.setOpenings(dto.getOpenings());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        return toDTO(recruitmentRepository.save(existing));
    }

    @Override
    public List<RecruitmentDTO> getAllPostings() {
        return recruitmentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public RecruitmentDTO getPostingById(Long id) {
        return toDTO(recruitmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found")));
    }

    @Override
    public void deletePosting(Long id) {
        recruitmentRepository.deleteById(id);
    }

    @Override
    public RecruitmentDTO updateStatus(Long id, String status) {
        Recruitment r = recruitmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
        r.setStatus(RecruitmentStatus.valueOf(status));
        return toDTO(recruitmentRepository.save(r));
    }

    private RecruitmentDTO toDTO(Recruitment r) {
        return RecruitmentDTO.builder()
                .id(r.getId()).jobTitle(r.getJobTitle()).department(r.getDepartment())
                .jobDescription(r.getJobDescription()).requirements(r.getRequirements())
                .location(r.getLocation()).jobType(r.getJobType())
                .salaryMin(r.getSalaryMin()).salaryMax(r.getSalaryMax())
                .applicantName(r.getApplicantName()).applicantEmail(r.getApplicantEmail())
                .applicantPhone(r.getApplicantPhone()).resumeUrl(r.getResumeUrl())
                .postedDate(r.getPostedDate()).closingDate(r.getClosingDate())
                .status(r.getStatus()).openings(r.getOpenings()).postedBy(r.getPostedBy())
                .build();
    }

    private Recruitment toEntity(RecruitmentDTO dto) {
        return Recruitment.builder()
                .jobTitle(dto.getJobTitle()).department(dto.getDepartment())
                .jobDescription(dto.getJobDescription()).requirements(dto.getRequirements())
                .location(dto.getLocation()).jobType(dto.getJobType())
                .salaryMin(dto.getSalaryMin()).salaryMax(dto.getSalaryMax())
                .applicantName(dto.getApplicantName()).applicantEmail(dto.getApplicantEmail())
                .applicantPhone(dto.getApplicantPhone()).resumeUrl(dto.getResumeUrl())
                .closingDate(dto.getClosingDate())
                .status(dto.getStatus()).openings(dto.getOpenings() != null ? dto.getOpenings() : 1)
                .postedBy(dto.getPostedBy())
                .build();
    }
}
