package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.EmployeeDocument;
import com.nexushr.entity.EmployeeStatus;
import com.nexushr.repository.EmployeeDocumentRepository;
import com.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/*
 * OnboardingWorkflow
 *
 * Tracks an employee's onboarding completion status across all required steps.
 * Steps:
 *   1. Profile photo uploaded
 *   2. Phone/address/gender/DOB filled
 *   3. Required documents uploaded (at least 1)
 *   4. Emergency contact registered
 *   5. Status is ACTIVE
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingWorkflow {

    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository documentRepository;

    public record OnboardingStep(String name, boolean completed, String hint) {}

    public record OnboardingStatus(
            Long employeeId,
            String employeeName,
            int completedSteps,
            int totalSteps,
            int completionPercent,
            boolean fullyOnboarded,
            List<OnboardingStep> steps
    ) {}

    /*
     * Evaluates onboarding completion for a given employee ID.
     */
    public OnboardingStatus getStatus(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        List<EmployeeDocument> docs = documentRepository.findByEmployeeId(employeeId);

        List<OnboardingStep> steps = new ArrayList<>();

        // Step 1: Profile photo
        boolean hasPhoto = emp.getProfilePhoto() != null && !emp.getProfilePhoto().isBlank();
        steps.add(new OnboardingStep("Profile Photo Uploaded", hasPhoto,
                hasPhoto ? null : "Upload a profile photo in the employee profile editor."));

        // Step 2: Personal details complete
        boolean hasPersonalDetails = emp.getPhone() != null && emp.getAddress() != null
                && emp.getGender() != null && emp.getDateOfBirth() != null;
        steps.add(new OnboardingStep("Personal Details Complete", hasPersonalDetails,
                hasPersonalDetails ? null : "Fill in phone, address, gender, and date of birth fields."));

        // Step 3: Documents uploaded
        boolean hasDocs = !docs.isEmpty();
        steps.add(new OnboardingStep("Documents Uploaded", hasDocs,
                hasDocs ? null : "Upload at least one onboarding document (e.g. ID, offer letter, NDA)."));

        // Step 4: Emergency contact
        boolean hasEmergency = emp.getEmergencyContact() != null && !emp.getEmergencyContact().isBlank();
        steps.add(new OnboardingStep("Emergency Contact Registered", hasEmergency,
                hasEmergency ? null : "Provide an emergency contact name and phone number."));

        // Step 5: Active status
        boolean isActive = emp.getStatus() == EmployeeStatus.ACTIVE;
        steps.add(new OnboardingStep("Account Activated", isActive,
                isActive ? null : "HR must mark the employee status as ACTIVE to complete onboarding."));

        long completed = steps.stream().filter(OnboardingStep::completed).count();
        int percent = (int) ((completed * 100.0) / steps.size());

        log.info("Onboarding status for employee {}: {}% complete ({}/{})",
                emp.getEmployeeName(), percent, completed, steps.size());

        return new OnboardingStatus(
                emp.getId(),
                emp.getEmployeeName(),
                (int) completed,
                steps.size(),
                percent,
                percent == 100,
                steps
        );
    }
}
