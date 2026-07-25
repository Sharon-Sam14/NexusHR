package com.nexushr.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final String UPLOAD_DIR = "uploads";

    public static class CloudinaryResponse {
        public String publicId;
        public String secureUrl;
        public Map<String, Object> metadata;
    }

    public CloudinaryResponse upload(MultipartFile file) throws IOException {
        // Validate uploads before storage
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        // Validation: Maximum size (10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        // Validation: Allowed file types (PDF, JPEG/JPG, PNG)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
                                    !contentType.equals("image/jpeg") && 
                                    !contentType.equals("image/png") &&
                                    !contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Only PDF, JPEG, and PNG file types are allowed");
        }

        CloudinaryResponse response = new CloudinaryResponse();

        // Check if using the mock configuration
        if ("nexushr-mock".equals(cloudinary.config.cloudName)) {
            log.info("[CLOUDINARY MOCK] Simulating upload for file: {}", file.getOriginalFilename());
            
            // Fallback: save locally
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String cleanFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
            Path filePath = uploadPath.resolve(cleanFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            response.publicId = "mock_" + UUID.randomUUID().toString();
            response.secureUrl = "http://localhost:8081/api/documents/mock-download/" + cleanFileName;
            response.metadata = Map.of("resource_type", "raw", "original_filename", file.getOriginalFilename());
            return response;
        }

        try {
            log.info("[CLOUDINARY] Uploading file to cloud: {}", file.getOriginalFilename());
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto"
            ));

            response.publicId = (String) uploadResult.get("public_id");
            response.secureUrl = (String) uploadResult.get("secure_url");
            response.metadata = uploadResult;
            return response;
        } catch (Exception e) {
            log.error("[CLOUDINARY] Cloud upload failed: {}. Falling back to local disk storage.", e.getMessage());
            
            // Fallback: save locally
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String cleanFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
            Path filePath = uploadPath.resolve(cleanFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            response.publicId = "fallback_" + UUID.randomUUID().toString();
            response.secureUrl = "http://localhost:8081/api/documents/mock-download/" + cleanFileName;
            response.metadata = Map.of("resource_type", "raw", "original_filename", file.getOriginalFilename());
            return response;
        }
    }

    public void delete(String publicId) {
        if (publicId == null || publicId.startsWith("mock_") || publicId.startsWith("fallback_")) {
            log.info("[CLOUDINARY MOCK/FALLBACK] Simulating deletion of publicId: {}", publicId);
            return;
        }
        try {
            log.info("[CLOUDINARY] Deleting resource: {}", publicId);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            log.error("[CLOUDINARY] Resource deletion failed: {}", e.getMessage());
        }
    }
}
