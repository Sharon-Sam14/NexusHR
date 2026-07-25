# NexusHR Security Architecture & Hardening Guide

This document details the security layers, authorization constraints, and threat mitigation strategies implemented in the **NexusHR** platform.

---

## 1. Authentication & Session Verification

NexusHR enforces stateless token authentication with database-backed session validation:

*   **JWT Access Tokens**: Issued on login and signed using HMAC-SHA256 with a 256-bit key. Expire in 24 hours. Contain subject details (user email) and role claims.
*   **Refresh Token Rotation (RTR)**: Long-lived opaque tokens stored in the database. When the client requests an access token refresh, the old refresh token is marked as revoked. This enforces refresh token rotation to prevent token reuse.

---

## 2. Authorization Rules & Ownership Verification

Access is restricted based on roles and resource ownership:

*   **Role-Based Access Control (RBAC)**: REST controller endpoints are restricted using `@PreAuthorize` rules (e.g. `@PreAuthorize("hasRole('ADMIN')")`).
*   **Ownership Check Helper**: Endpoints managing personal records are protected using ownership checks:
    ```java
    @PreAuthorize("@securityHelper.isOwner(#employeeId)")
    ```
    `SecurityHelper.java` queries the security context to verify that the requesting user owns the target record.

---

## 3. Threat Mitigation Strategies

### 3.1 SQL Injection Prevention
*   Spring Data JPA repositories use prepared statements to sanitize parameters and prevent SQL injection.

### 3.2 Cross-Site Scripting (XSS) Prevention
*   Vite encodes dynamic text inputs by default. Request payloads are validated at the controller level to prevent malicious script execution.

### 3.3 File Upload Security
*   Uploaded files are sanitized. Paths are scrubbed of navigation characters (such as `../`) to prevent directory traversal attacks.

### 3.4 CORS & CSRF Settings
*   **CORS**: Configured in `SecurityConfig.java` to restrict allowed origins and headers.
*   **CSRF**: Disabled because the application uses stateless JWTs instead of cookie-based sessions.
