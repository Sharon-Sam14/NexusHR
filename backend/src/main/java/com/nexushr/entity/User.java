package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

/*
 * User Entity
 *
 * Stores authentication and profile information.
 * Linked to Employee record for HR data.
 */

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Full Name
     */
    @Column(nullable = false)
    private String name;

    /*
     * Email — unique login identifier
     */
    @Column(nullable = false, unique = true)
    private String email;

    /*
     * BCrypt-encrypted password
     */
    @Column(nullable = false)
    private String password;

    /*
     * Role-based access control
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /*
     * Link to Employee record (optional for ADMIN)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    /*
     * Account active status
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

}