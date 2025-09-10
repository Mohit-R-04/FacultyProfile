package com.ssn.faculty.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Value("${file.max-file-size}")
    private String maxFileSize;
    
    private final List<String> allowedExtensions = Arrays.asList("pdf", "jpg", "jpeg", "png", "doc", "docx");
    
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }
        
        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new RuntimeException("File name cannot be null or empty");
        }
        originalFilename = StringUtils.cleanPath(originalFilename);
        String extension = getFileExtension(originalFilename);
        
        if (extension.isEmpty() || !allowedExtensions.contains(extension.toLowerCase())) {
            throw new RuntimeException("File type not allowed: " + extension + ". Allowed types: " + allowedExtensions);
        }
        
        // Validate file size
        long maxSize = parseFileSize(maxFileSize);
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File size too large. Maximum allowed: " + maxFileSize + ", actual size: " + (file.getSize() / 1024 / 1024) + "MB");
        }
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            logger.info("Upload directory: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                logger.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }
            
            // Check if directory is writable
            if (!Files.isWritable(uploadPath)) {
                throw new RuntimeException("Upload directory is not writable: " + uploadPath);
            }
            
            // Generate unique filename
            String uniqueFilename = UUID.randomUUID().toString() + "-" + originalFilename;
            Path targetLocation = uploadPath.resolve(uniqueFilename);
            
            // Copy file to target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            logger.info("File stored successfully: {} -> {}", originalFilename, uniqueFilename);
            return "/uploads/" + uniqueFilename;
            
        } catch (IOException ex) {
            logger.error("Failed to store file: {}", originalFilename, ex);
            throw new RuntimeException("Failed to store file " + originalFilename + ": " + ex.getMessage(), ex);
        }
    }
    
    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filename, ex);
        }
    }
    
    public void deleteFile(String filePath) {
        if (filePath == null || !filePath.startsWith("/uploads/")) {
            return;
        }
        
        try {
            String filename = filePath.substring("/uploads/".length());
            Path file = Paths.get(uploadDir).resolve(filename).normalize();
            
            if (Files.exists(file)) {
                Files.delete(file);
                logger.info("File deleted successfully: {}", filename);
            }
        } catch (IOException ex) {
            logger.error("Failed to delete file: {}", filePath, ex);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
    
    private long parseFileSize(String size) {
        if (size.endsWith("MB")) {
            return Long.parseLong(size.substring(0, size.length() - 2)) * 1024 * 1024;
        } else if (size.endsWith("KB")) {
            return Long.parseLong(size.substring(0, size.length() - 2)) * 1024;
        } else {
            return Long.parseLong(size);
        }
    }
}
