package com.nexushr.service.impl;

import com.nexushr.dto.ForgotPasswordRequest;
import com.nexushr.dto.LoginRequest;
import com.nexushr.dto.LoginResponse;
import com.nexushr.dto.RegisterRequest;
import com.nexushr.dto.ResetPasswordRequest;
import com.nexushr.entity.Role;
import com.nexushr.entity.User;
import com.nexushr.repository.UserRepository;
import com.nexushr.security.JwtUtil;
import com.nexushr.service.AuthService;
import com.nexushr.service.RefreshTokenService;
import com.nexushr.notification.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/*
 * Auth Service Implementation
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    /*
     * Register a new user
     */
    @Override
    public LoginResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.EMPLOYEE;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name());
        String refreshToken = refreshTokenService.generate(saved.getEmail()).getToken();

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .userId(saved.getId())
                .build();
    }

    /*
     * Authenticate and return JWT
     */
    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.generate(user.getEmail()).getToken();

        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .employeeId(employeeId)
                .build();
    }

    /*
     * Process forgot password request and send reset email
     */
    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account registered with this email address"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Send simulated email
        String emailBody = String.format(
            "Dear %s,\n\n" +
            "You requested a password reset for your NexusHR account. Please use the following token to reset your password:\n\n" +
            "Token: %s\n\n" +
            "This token is valid for 1 hour. If you did not make this request, you can safely ignore this email.\n\n" +
            "Best regards,\n" +
            "NexusHR Security Gateway",
            user.getName(), token
        );

        emailService.send(user.getEmail(), "[NexusHR] Password Reset Request", emailBody);
    }

    /*
     * Verify token and update password
     */
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or unrecognized password reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("The password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        User savedUser = userRepository.save(user);

        // Send confirmation email
        String confirmationBody = String.format(
            "Dear %s,\n\n" +
            "This email confirms that the password for your NexusHR account (%s) was successfully changed.\n\n" +
            "If you did not make this change, please contact your system administrator immediately.\n\n" +
            "Best regards,\n" +
            "NexusHR Security Gateway",
            savedUser.getName(), savedUser.getEmail()
        );
        emailService.send(savedUser.getEmail(), "[NexusHR] Password Changed Successfully", confirmationBody);
    }

}