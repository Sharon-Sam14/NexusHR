package com.nexushr.service.impl;

import com.nexushr.dto.DepartmentMapper;
import com.nexushr.dto.DepartmentRequest;
import com.nexushr.dto.DepartmentResponse;
import com.nexushr.entity.Department;
import com.nexushr.repository.DepartmentRepository;
import com.nexushr.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DepartmentServiceImpl — Implementation of DepartmentService.
 *
 * All API boundaries use DTOs; the JPA entity is confined to this class and the repository.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Department '" + request.getName() + "' already exists.");
        }
        Department entity = departmentMapper.toEntity(request);
        Department saved = departmentRepository.save(entity);
        log.info("[DEPARTMENT] Created department '{}'", saved.getName());
        return departmentMapper.toResponse(saved);
    }

    @Override
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        // If the name is being changed, verify the new name is not already taken by another department
        if (!existing.getName().equals(request.getName())
                && departmentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Department '" + request.getName() + "' already exists.");
        }

        departmentMapper.updateEntity(existing, request);
        Department saved = departmentRepository.save(existing);
        log.info("[DEPARTMENT] Updated department id={} name='{}'", id, saved.getName());
        return departmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
        log.info("[DEPARTMENT] Deleted department id={}", id);
    }
}
