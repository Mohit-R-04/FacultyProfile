package com.ssn.faculty.controller;

import com.ssn.faculty.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/files")
@Tag(name = "File Management", description = "File upload and download APIs")
public class FileController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @PostMapping("/upload")
    @Operation(summary = "Upload file", description = "Upload a file to the server")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String filePath = fileStorageService.storeFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("filePath", filePath);
            response.put("message", "File uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/download/**")
    @Operation(summary = "Download file", description = "Download a file from the server")
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) {
        try {
            // Get the full path from the request
            String fullPath = request.getRequestURI();
            String filename = fullPath.substring(fullPath.indexOf("/download/") + "/download/".length());
            
            // Extract just the filename from the path if it contains /uploads/
            String actualFilename = filename;
            if (filename.startsWith("/uploads/")) {
                actualFilename = filename.substring("/uploads/".length());
            }
            
            Resource resource = fileStorageService.loadFileAsResource(actualFilename);
            
            String contentType = "application/octet-stream";
            if (actualFilename.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (actualFilename.endsWith(".jpg") || actualFilename.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (actualFilename.endsWith(".png")) {
                contentType = "image/png";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + actualFilename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
