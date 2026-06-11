package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/*
 * RefreshToken Entity
 *
 * Stores long-lived opaque refresh tokens linked to user accounts.
 * Used to obtain new access tokens after expiry without requiring re-login.
 *
 * Each refresh token is:
 *   - Unique per issuance (UUID-based token string)
 *   - Linked to a User record
 *   - Expired after a configurable duration (default: 7 days)
 *   - Revocable (revoked=true marks it invalid without deleting the record)
 */
@Entity
@Table(name = "refresh_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Unique opaque token string (UUID)
     */
    @Column(nullable = false, unique = true)
    private String token;

    /*
     * Associated user
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /*
     * Token expiry timestamp
     */
    @Column(nullable = false)
    private Instant expiresAt;

    /*
     * Revocation flag — soft-invalidates the token
     */
    @Builder.Default
    private boolean revoked = false;

    /*
     * Creation timestamp
     */
    @Builder.Default
    private Instant createdAt = Instant.now();
}
