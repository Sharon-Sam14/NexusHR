package com.nexushr.controller;

import com.nexushr.dto.UserDTO;
import com.nexushr.entity.Role;
import com.nexushr.entity.User;
import com.nexushr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.nexushr.util.AuditLogger;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAllByOrderByEmailAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create-hr")
    public ResponseEntity<UserDTO> createHrUser(@RequestBody UserDTO dto) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("[AUDIT] Admin {} is creating a new HR user: {}", adminEmail, dto.getEmail());

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.HR)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        log.info("[AUDIT] Admin {} successfully created HR user ID: {}", adminEmail, saved.getId());
        AuditLogger.log(adminEmail, "USER_CREATED", saved.getEmail(), "Created HR User");
        return ResponseEntity.ok(toDTO(saved));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String roleStr = body.get("role");
        log.info("[AUDIT] Admin {} is updating role of user ID {} to {}", adminEmail, id, roleStr);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(Role.valueOf(roleStr));
        User saved = userRepository.save(user);
        log.info("[AUDIT] Admin {} successfully updated role of user ID {} to {}", adminEmail, id, roleStr);
        AuditLogger.log(adminEmail, "USER_ROLE_UPDATED", saved.getEmail(), "New Role: " + roleStr);
        return ResponseEntity.ok(toDTO(saved));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String newPassword = body.get("password");
        log.info("[AUDIT] Admin {} is resetting password for user ID {}", adminEmail, id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("[AUDIT] Admin {} successfully reset password for user ID {}", adminEmail, id);
        AuditLogger.log(adminEmail, "USER_PASSWORD_RESET", user.getEmail(), "Admin password reset");
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<UserDTO> lockUnlockAccount(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Boolean active = body.get("active");
        log.info("[AUDIT] Admin {} is setting active status of user ID {} to {}", adminEmail, id, active);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(active);
        User saved = userRepository.save(user);
        log.info("[AUDIT] Admin {} successfully set active status of user ID {} to {}", adminEmail, id, active);
        AuditLogger.log(adminEmail, active ? "USER_UNLOCKED" : "USER_LOCKED", saved.getEmail(), "Toggled active status");
        return ResponseEntity.ok(toDTO(saved));
    }

    private UserDTO toDTO(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .active(u.isActive())
                .build();
    }
}
