package com.nexushr.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DocumentDTO {
    private Long id;
    private Long employeeId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String publicId;
    private String secureUrl;
    private String uploader;
    private Long leaveRequestId;
    private String documentType;
}
