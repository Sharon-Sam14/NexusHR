package com.nexushr.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

/*
 * JwtTokenProvider
 *
 * Replaces the simpler JwtUtil with a full production-grade token provider.
 *
 * Responsibilities:
 *   - Token generation (access tokens with role + jti claims)
 *   - Signature verification using HMAC-SHA256
 *   - Claims extraction (email, role, expiry, jti)
 *   - Token expiry detection
 *   - Graceful invalid token handling
 *
 * The jti (JWT ID) is a unique UUID per token, enabling future revocation lists.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /*
     * Creates a signed access token with email (sub), role claim, and unique jti.
     */
    public String createToken(String email, String role) {
        String jti = UUID.randomUUID().toString();
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        String token = Jwts.builder()
                .setId(jti)
                .setSubject(email)
                .claim("role", role)
                .claim("type", "ACCESS")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        log.debug("[JWT] Access token issued for {} | jti={} | expires={}", email, jti, expiry);
        return token;
    }

    /*
     * Extracts the email (subject) from the token.
     */
    public String getEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /*
     * Extracts the role claim from the token.
     */
    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /*
     * Extracts the unique token ID (jti) for revocation tracking.
     */
    public String getJti(String token) {
        return parseClaims(token).getId();
    }

    /*
     * Returns the token expiration date.
     */
    public Date getExpiry(String token) {
        return parseClaims(token).getExpiration();
    }

    /*
     * Validates token: verifies signature and checks it hasn't expired.
     * Returns false (not throws) on any validation failure for safe use in filters.
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            if (claims.getExpiration().before(new Date())) {
                log.warn("[JWT] Token expired for subject={}", claims.getSubject());
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("[JWT] Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /*
     * Validates token against a specific expected email.
     */
    public boolean validateToken(String token, String email) {
        try {
            return getEmail(token).equals(email) && validateToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
