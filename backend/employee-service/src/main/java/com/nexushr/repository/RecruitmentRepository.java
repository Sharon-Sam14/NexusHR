package com.nexushr.repository;

import com.nexushr.entity.Recruitment;
import com.nexushr.entity.RecruitmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> {

    List<Recruitment> findByStatus(RecruitmentStatus status);

    List<Recruitment> findByDepartment(String department);

    long countByStatus(RecruitmentStatus status);

}
