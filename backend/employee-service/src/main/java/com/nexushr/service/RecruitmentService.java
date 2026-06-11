package com.nexushr.service;

import com.nexushr.dto.RecruitmentDTO;

import java.util.List;

public interface RecruitmentService {
    RecruitmentDTO createPosting(RecruitmentDTO dto);
    RecruitmentDTO updatePosting(Long id, RecruitmentDTO dto);
    List<RecruitmentDTO> getAllPostings();
    RecruitmentDTO getPostingById(Long id);
    void deletePosting(Long id);
    RecruitmentDTO updateStatus(Long id, String status);
}
