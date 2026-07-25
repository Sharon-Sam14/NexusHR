package com.nexushr.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String fileType;

    private Long fileSize;

    private LocalDateTime uploadedAt;

    private String publicId;

    private String secureUrl;

    private String uploader;

    /*
     * Optional: references the leave_request this document was uploaded for
     * (populated for MEDICAL_CERTIFICATE document type)
     */
    private Long leaveRequestId;

    /*
     * Document category: MEDICAL_CERTIFICATE, ONBOARDING, CONTRACT, OTHER
     */
    @Builder.Default
    private String documentType = "OTHER";

}
