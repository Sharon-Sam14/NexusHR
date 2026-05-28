package com.nexushr.controller;

import com.nexushr.dto.DocumentDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.EmployeeDocument;
import com.nexushr.repository.EmployeeDocumentRepository;
import com.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DocumentController {

    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final EmployeeRepository employeeRepository;
    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<DocumentDTO> uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file) throws IOException {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Create upload directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Clean file name to prevent directory traversal
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unnamed_file";
        }
        String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
        Path filePath = uploadPath.resolve(cleanFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        EmployeeDocument document = EmployeeDocument.builder()
                .employee(employee)
                .fileName(originalFileName)
                .filePath(filePath.toString())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .build();

        EmployeeDocument saved = employeeDocumentRepository.save(document);

        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<DocumentDTO>> listDocuments(@PathVariable Long employeeId) {
        List<DocumentDTO> list = employeeDocumentRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/documents/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isDocumentOwner(#id)")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        EmployeeDocument doc = employeeDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            Path path = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = doc.getFileType();
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read file");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not download file: " + e.getMessage());
        }
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isDocumentOwner(#id)")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        EmployeeDocument doc = employeeDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            Path path = Paths.get(doc.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log issue but proceed to clear DB entry
        }

        employeeDocumentRepository.delete(doc);
        return ResponseEntity.noContent().build();
    }

    private DocumentDTO toDTO(EmployeeDocument doc) {
        return DocumentDTO.builder()
                .id(doc.getId())
                .employeeId(doc.getEmployee().getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
