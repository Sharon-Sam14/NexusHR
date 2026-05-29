package com.nexushr.service;

import com.nexushr.entity.RefreshToken;
import com.nexushr.entity.User;
import com.nexushr.repository.RefreshTokenRepository;
import com.nexushr.repository.UserRepository;
import com.nexushr.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/*
 * RefreshTokenService
 *
 * Manages the full lifecycle of opaque refresh tokens:
 *   1. Generation — creates and stores a UUID refresh token for a user.
 *   2. Verification — validates existence, revocation, and expiry.
 *   3. Rotation — verifies an old token, revokes it, issues a new access + refresh pair.
 *   4. Revocation — soft-revokes all tokens for a user (on logout).
 *   5. Cleanup — scheduled job purges expired tokens daily.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@SuppressWarnings("null")
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_VALIDITY_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /*
     * Result of a token rotation operation.
     */
    public record TokenPair(String accessToken, String refreshToken) {}

    /*
     * Issues a new refresh token for the given user email.
     * Revokes all previous active refresh tokens for the user (single-session model).
     */
    public RefreshToken generate(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Revoke existing active tokens
        refreshTokenRepository.revokeAllByUserId(user.getId());

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(Instant.now().plusMillis(REFRESH_TOKEN_VALIDITY_MS))
                .revoked(false)
                .createdAt(Instant.now())
                .build();

        RefreshToken saved = refreshTokenRepository.save(token);
        log.info("[REFRESH-TOKEN] Issued for {} | expires={}", email, saved.getExpiresAt());
        return saved;
    }

    /*
     * Verifies a refresh token string.
     * Throws RuntimeException on invalid, revoked, or expired tokens.
     */
    public RefreshToken verify(String tokenStr) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (token.isRevoked()) {
            log.warn("[REFRESH-TOKEN] Attempted use of revoked token for user={}", token.getUser().getEmail());
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            log.warn("[REFRESH-TOKEN] Expired token for user={}", token.getUser().getEmail());
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new RuntimeException("Refresh token has expired. Please log in again.");
        }

        return token;
    }

    /*
     * Rotates the token: verifies old, revokes it, issues new access + refresh pair.
     * This is the "sliding window" approach — each refresh grants a fresh token pair.
     */
    public TokenPair rotate(String oldTokenStr) {
        RefreshToken old = verify(oldTokenStr);
        User user = old.getUser();

        // Revoke the used token
        old.setRevoked(true);
        refreshTokenRepository.save(old);

        // Issue new access token
        String accessToken = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());

        // Issue new refresh token
        RefreshToken newRefresh = generate(user.getEmail());

        log.info("[REFRESH-TOKEN] Rotated tokens for user={}", user.getEmail());
        return new TokenPair(accessToken, newRefresh.getToken());
    }

    /*
     * Revokes all active refresh tokens for a user (logout).
     */
    public void revokeAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        refreshTokenRepository.revokeAllByUserId(user.getId());
        log.info("[REFRESH-TOKEN] All tokens revoked for {}", email);
    }

    /*
     * Scheduled cleanup — removes expired tokens every 24 hours at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void purgeExpiredTokens() {
        refreshTokenRepository.deleteAllExpiredBefore(Instant.now());
        log.info("[REFRESH-TOKEN] Purged expired tokens.");
    }
}
