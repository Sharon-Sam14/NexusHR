package com.nexushr.dto;

import lombok.*;

/*
 * Login Response DTO
 *
 * Returned after successful authentication.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String refreshToken;
    private String name;
    private String email;
    private String role;
    private Long userId;
    private Long employeeId;

}