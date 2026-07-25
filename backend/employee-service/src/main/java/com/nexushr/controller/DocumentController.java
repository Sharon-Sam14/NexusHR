package com.nexushr.controller;

import com.nexushr.dto.DocumentDTO;
import com.nexushr.entity.Employee;
import com.nexushr.entity.EmployeeDocument;
import com.nexushr.repository.EmployeeDocumentRepository;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.service.CloudinaryService;
import com.nexushr.util.AuditLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DocumentController
 *
 * Handles all employee document operations:
 *  - Upload to Cloudinary (with mock fallback)
 *  - List, Preview, Download, Delete
 *  - Medical certificate upload for leave requests
 *
 * Supports document types: MEDICAL_CERTIFICATE, ONBOARDING, CONTRACT, OTHER
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DocumentController {

    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final EmployeeRepository employeeRepository;
    private final CloudinaryService cloudinaryService;
    private static final String UPLOAD_DIR = "uploads";

    /**
     * Upload a document for an employee.
     *
     * Optional params:
     *   leaveRequestId  — if provided, document is linked to a leave request (medical certificate)
     *   documentType    — MEDICAL_CERTIFICATE | ONBOARDING | CONTRACT | OTHER (default: OTHER)
     */
    @PostMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<DocumentDTO> uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "leaveRequestId", required = false) Long leaveRequestId,
            @RequestParam(value = "documentType", defaultValue = "OTHER") String documentType) throws IOException {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Upload to Cloudinary (with fallback to local storage if mock/failed)
        CloudinaryService.CloudinaryResponse uploadResponse = cloudinaryService.upload(file);

        EmployeeDocument document = EmployeeDocument.builder()
                .employee(employee)
                .fileName(file.getOriginalFilename())
                .filePath(uploadResponse.secureUrl) // compatibility mapping
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .publicId(uploadResponse.publicId)
                .secureUrl(uploadResponse.secureUrl)
                .uploader(AuditLogger.getCurrentUserEmail())
                .leaveRequestId(leaveRequestId)
                .documentType(documentType)
                .build();

        EmployeeDocument saved = employeeDocumentRepository.save(document);
        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "DOCUMENT_UPLOADED", saved.getFileName(),
                "Uploaded to Cloudinary | Type: " + documentType
                        + (leaveRequestId != null ? " | LeaveRequest: " + leaveRequestId : ""));

        return ResponseEntity.ok(toDTO(saved));
    }

    /**
     * List all documents for an employee.
     */
    @GetMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isOwner(#employeeId)")
    public ResponseEntity<List<DocumentDTO>> listDocuments(@PathVariable Long employeeId) {
        List<DocumentDTO> list = employeeDocumentRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Download a document — redirects to Cloudinary URL for cloud documents,
     * or serves the file from local disk for mock/fallback documents.
     */
    @GetMapping("/documents/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isDocumentOwner(#id)")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id) {
        EmployeeDocument doc = employeeDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // If it's a cloud resource (external HTTP URL) but not a mock local URL, redirect directly
        if (doc.getSecureUrl() != null && doc.getSecureUrl().startsWith("http")
                && !doc.getSecureUrl().contains("/documents/mock-download/")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(doc.getSecureUrl()))
                    .build();
        }

        // For mock local URLs or local paths, parse the filename and serve from local disk
        String cleanFileName = doc.getFileName();
        if (doc.getSecureUrl() != null && doc.getSecureUrl().contains("/documents/mock-download/")) {
            String url = doc.getSecureUrl();
            cleanFileName = url.substring(url.lastIndexOf("/") + 1);
        } else {
            cleanFileName = doc.getFilePath().substring(doc.getFilePath().lastIndexOf(java.io.File.separator) + 1);
        }

        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(cleanFileName);
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

    /**
     * Preview a document inline (opens in browser rather than downloading).
     * Redirects to Cloudinary secure URL for cloud documents.
     */
    @GetMapping("/documents/{id}/preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isDocumentOwner(#id)")
    public ResponseEntity<?> previewDocument(@PathVariable Long id) {
        EmployeeDocument doc = employeeDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // For cloud documents: redirect to the Cloudinary secure URL (opens inline in browser)
        if (doc.getSecureUrl() != null && doc.getSecureUrl().startsWith("http")
                && !doc.getSecureUrl().contains("/documents/mock-download/")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(doc.getSecureUrl()))
                    .build();
        }

        // For mock/local documents: serve inline with content-disposition inline
        String cleanFileName = doc.getFileName();
        if (doc.getSecureUrl() != null && doc.getSecureUrl().contains("/documents/mock-download/")) {
            String url = doc.getSecureUrl();
            cleanFileName = url.substring(url.lastIndexOf("/") + 1);
        }

        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(cleanFileName);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = doc.getFileType() != null ? doc.getFileType() : "application/octet-stream";
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Convenience endpoint: get the medical certificate for a specific leave request.
     */
    @GetMapping("/leave/{leaveRequestId}/document")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<DocumentDTO> getLeaveDocument(@PathVariable Long leaveRequestId) {
        return employeeDocumentRepository.findByLeaveRequestId(leaveRequestId)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a document — removes from Cloudinary and database.
     * Cleans up local fallback file if applicable.
     */
    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @securityHelper.isDocumentOwner(#id)")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        EmployeeDocument doc = employeeDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Delete from Cloudinary
        cloudinaryService.delete(doc.getPublicId());

        // If local file exists (fallback mock), clean it up from disk
        if (doc.getSecureUrl() != null && doc.getSecureUrl().contains("/documents/mock-download/")) {
            String url = doc.getSecureUrl();
            String cleanFileName = url.substring(url.lastIndexOf("/") + 1);
            try {
                Path path = Paths.get(UPLOAD_DIR).resolve(cleanFileName);
                Files.deleteIfExists(path);
            } catch (IOException e) {
                // Ignore failure — file cleanup is best-effort
            }
        } else {
            try {
                Path path = Paths.get(doc.getFilePath());
                Files.deleteIfExists(path);
            } catch (Exception e) {
                // Ignore failure
            }
        }

        employeeDocumentRepository.delete(doc);
        AuditLogger.log(AuditLogger.getCurrentUserEmail(), "DOCUMENT_DELETED", doc.getFileName(), "Removed from DB and cloud");
        return ResponseEntity.noContent().build();
    }

    /**
     * Serve fallback local uploads (mock mode).
     */
    @GetMapping("/documents/mock-download/{filename:.+}")
    public ResponseEntity<Resource> downloadMockFile(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + filename.substring(filename.indexOf("_") + 1) + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private DocumentDTO toDTO(EmployeeDocument doc) {
        return DocumentDTO.builder()
                .id(doc.getId())
                .employeeId(doc.getEmployee().getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .uploadedAt(doc.getUploadedAt())
                .publicId(doc.getPublicId())
                .secureUrl(doc.getSecureUrl())
                .uploader(doc.getUploader())
                .leaveRequestId(doc.getLeaveRequestId())
                .documentType(doc.getDocumentType())
                .build();
    }
}
