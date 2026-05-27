package com.nexushr.service.impl;

import com.nexushr.dto.LoginRequest;
import com.nexushr.dto.LoginResponse;
import com.nexushr.dto.RegisterRequest;
import com.nexushr.entity.Role;
import com.nexushr.entity.User;
import com.nexushr.repository.UserRepository;
import com.nexushr.security.JwtUtil;
import com.nexushr.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/*
 * Auth Service Implementation
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

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

        return LoginResponse.builder()
                .token(token)
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

        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;

        return LoginResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .employeeId(employeeId)
                .build();
    }

}