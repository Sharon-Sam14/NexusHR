package com.nexushr.controller;

import com.nexushr.dto.LoginRequest;
import com.nexushr.dto.LoginResponse;
import com.nexushr.dto.RegisterRequest;
import com.nexushr.service.AuthService;
import com.nexushr.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/*
 * Authentication Controller
 *
 * Handles:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh    → exchange refresh token for new access + refresh token pair
 * - POST /api/auth/logout     → revoke all refresh tokens for the current user
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /*
     * Rotates a refresh token: verifies the old one, revokes it,
     * and issues a new access + refresh token pair.
     * Body: { "refreshToken": "<token>" }
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String oldToken = body.get("refreshToken");
        if (oldToken == null || oldToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        RefreshTokenService.TokenPair pair = refreshTokenService.rotate(oldToken);
        return ResponseEntity.ok(Map.of(
                "accessToken",  pair.accessToken(),
                "refreshToken", pair.refreshToken()
        ));
    }

    /*
     * Revokes all active refresh tokens for the currently authenticated user.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@AuthenticationPrincipal UserDetails user) {
        if (user != null) {
            refreshTokenService.revokeAll(user.getUsername());
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}