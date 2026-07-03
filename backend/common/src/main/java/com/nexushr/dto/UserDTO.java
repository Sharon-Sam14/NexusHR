package com.nexushr.dto;

import com.nexushr.entity.Role;
import lombok.*;

/*
 * User DTO for Admin actions and management
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private String password;

}
