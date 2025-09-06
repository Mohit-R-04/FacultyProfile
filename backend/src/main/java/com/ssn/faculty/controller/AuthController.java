package com.ssn.faculty.controller;

import com.ssn.faculty.dto.LoginRequest;
import com.ssn.faculty.dto.LoginResponse;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.security.UserPrincipal;
import com.ssn.faculty.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid email or password");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user information")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userService.findById(userPrincipal.getId()).orElse(null);
            
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("profileId", user.getProfile() != null ? user.getProfile().getId() : null);
            response.put("name", user.getProfile() != null ? user.getProfile().getName() : null);
            response.put("isLocked", user.getProfile() != null ? user.getProfile().getIsLocked() : false);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get user information");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
