package com.nexushr.service.impl;

import com.nexushr.dto.EmployeeDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.EmployeeStatus;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.nexushr.util.AuditLogger;
import org.springframework.transaction.annotation.Transactional;

/*
 * Employee Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return toDTO(employee);
    }

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        Employee employee = toEntity(dto);
        if (employee.getStatus() == null) {
            employee.setStatus(EmployeeStatus.ACTIVE);
        }
        Employee saved = employeeRepository.save(employee);
        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "EMPLOYEE_CREATED", saved.getEmployeeName(), "Initial Salary: " + saved.getSalary());
        return toDTO(saved);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            boolean salaryChanged = dto.getSalary() != null && !existing.getSalary().equals(dto.getSalary());
            if (salaryChanged) {
                throw new RuntimeException("HR cannot directly modify employee salaries. Please submit a Salary Approval Request on the Payroll page.");
            }
            if (dto.getStatus() != null && dto.getStatus() != existing.getStatus()) {
                throw new RuntimeException("Only Admin can change employee activation status.");
            }
        }

        existing.setEmployeeName(dto.getEmployeeName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setDepartment(dto.getDepartment());
        existing.setDesignation(dto.getDesignation());
        existing.setSalary(dto.getSalary());
        existing.setJoiningDate(dto.getJoiningDate());
        existing.setProfilePhoto(dto.getProfilePhoto());
        existing.setAddress(dto.getAddress());
        existing.setGender(dto.getGender());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setEmergencyContact(dto.getEmergencyContact());
        if (dto.getLeaveBalance() != null) {
            existing.setLeaveBalance(dto.getLeaveBalance());
        }
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        Employee saved = employeeRepository.save(existing);
        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "EMPLOYEE_UPDATED", saved.getEmployeeName(), "Updated details");
        return toDTO(saved);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new RuntimeException("Only Admin can delete employees.");
        }
        employeeRepository.deleteById(id);
        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "EMPLOYEE_DELETED", existing.getEmployeeName(), "Deleted employee profile");
    }

    @Override
    public List<EmployeeDTO> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /*
     * Mapper: Entity → DTO
     */
    private EmployeeDTO toDTO(Employee e) {
        return EmployeeDTO.builder()
                .id(e.getId())
                .employeeName(e.getEmployeeName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .department(e.getDepartment())
                .designation(e.getDesignation())
                .salary(e.getSalary())
                .joiningDate(e.getJoiningDate())
                .profilePhoto(e.getProfilePhoto())
                .address(e.getAddress())
                .status(e.getStatus())
                .gender(e.getGender())
                .dateOfBirth(e.getDateOfBirth())
                .emergencyContact(e.getEmergencyContact())
                .leaveBalance(e.getLeaveBalance())
                .build();
    }

    /*
     * Mapper: DTO → Entity
     */
    private Employee toEntity(EmployeeDTO dto) {
        return Employee.builder()
                .employeeName(dto.getEmployeeName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .salary(dto.getSalary())
                .joiningDate(dto.getJoiningDate())
                .profilePhoto(dto.getProfilePhoto())
                .address(dto.getAddress())
                .status(dto.getStatus() != null ? dto.getStatus() : EmployeeStatus.ACTIVE)
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .emergencyContact(dto.getEmergencyContact())
                .leaveBalance(dto.getLeaveBalance() != null ? dto.getLeaveBalance() : 15)
                .build();
    }

}