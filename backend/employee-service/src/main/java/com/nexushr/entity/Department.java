package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;

/*
 * Department Entity
 *
 * Represents a company department.
 */

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;

    private String headName;

    @Builder.Default
    private boolean active = true;

}
