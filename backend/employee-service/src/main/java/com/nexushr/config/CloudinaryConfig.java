package com.nexushr.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isBlank() || 
            apiKey == null || apiKey.isBlank() || 
            apiSecret == null || apiSecret.isBlank()) {
            // Safe fallback configuration for development/testing environments
            return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "nexushr-mock",
                "api_key", "123456789",
                "api_secret", "mock-api-secret-key"
            ));
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }
}
