package com.nexushr.security;

import com.nexushr.dto.EmployeeCreatedEvent;
import com.nexushr.entity.User;
import com.nexushr.entity.Role;
import com.nexushr.repository.UserRepository;
import com.nexushr.notification.NotificationDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Event Listener that handles automatic User credentials creation and onboarding email dispatches
 * when a new employee record is created.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmployeeCreatedListener {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final NotificationDispatcher notificationDispatcher;

    @EventListener
    @Transactional
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        String email = event.getEmployee().getEmail();
        String name = event.getEmployee().getEmployeeName();
        log.info("[ONBOARDING] Event received for employee: {} <{}>", name, email);

        if (userRepository.existsByEmail(email)) {
            log.warn("[ONBOARDING] User account already exists for email: {}. Skipping account creation.", email);
            return;
        }

        // Generate temporary password
        String plainPassword = "emp12345";

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(plainPassword))
                .role(Role.EMPLOYEE)
                .employee(event.getEmployee())
                .active(true)
                .build();

        userRepository.save(user);
        log.info("[ONBOARDING] Generated login credentials for {} (Role: EMPLOYEE)", email);

        // Dispatch simulated onboarding email
        String title = "Welcome to NexusHR — Onboarding Credentials";
        String message = "Dear " + name + ",\n\n" +
                "Welcome to the team! Your employee profile has been created successfully.\n\n" +
                "Your login username is: " + email + "\n" +
                "Your temporary login password is: " + plainPassword + "\n\n" +
                "You can log in immediately at: http://localhost:5173/\n" +
                "Please make sure to change your password after your first login.";

        notificationDispatcher.dispatch(new NotificationDispatcher.DispatchPayload(
                email,
                title,
                message,
                "SYSTEM",
                "/profile",
                event.getEmployee().getPhone()
        ));
        log.info("[ONBOARDING] Welcome and onboarding credentials dispatched for {}", email);
    }
}
