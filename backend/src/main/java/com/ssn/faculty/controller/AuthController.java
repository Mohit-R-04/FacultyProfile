package com.ssn.faculty.controller;

import com.ssn.faculty.dto.LoginRequest;
import com.ssn.faculty.dto.LoginResponse;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.security.UserPrincipal;
import com.ssn.faculty.service.UserService;
import com.ssn.faculty.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
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
    
    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verify user email with token")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = emailService.verifyEmail(token);
            
            Map<String, Object> response = new HashMap<>();
            if (verified) {
                response.put("message", "Email verified successfully");
                response.put("verified", true);
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Invalid or expired verification token");
                response.put("verified", false);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email verification failed");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resend email verification for user")
    public ResponseEntity<?> resendVerificationEmail(@RequestParam String email) {
        try {
            var user = userService.findByEmail(email);
            if (user.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            emailService.sendVerificationEmail(user.get());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification email sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send verification email");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Send password reset email to user")
    public ResponseEntity<?> forgotPassword(@RequestParam String email, HttpServletRequest request) {
        try {
            // Check IP rate limiting
            String clientIp = getClientIpAddress(request);
            if (!emailService.checkIpRateLimit(clientIp, "PASSWORD_RESET")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Too many password reset requests. Please try again later.");
                return ResponseEntity.status(429).body(error);
            }
            
            var user = userService.findByEmail(email);
            if (user.isEmpty()) {
                // Don't reveal if email exists or not for security
                Map<String, String> response = new HashMap<>();
                response.put("message", "If the email exists, a password reset link has been sent");
                return ResponseEntity.ok(response);
            }
            
            emailService.sendPasswordResetEmail(user.get(), request);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "If the email exists, a password reset link has been sent");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process password reset request");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset user password with token")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        try {
            if (newPassword == null || newPassword.length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Encode the new password before passing to service
            String encodedPassword = passwordEncoder.encode(newPassword);
            boolean success = emailService.resetPassword(token, encodedPassword);
            
            if (success) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password reset successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid or expired reset token");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Password reset failed");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/email-stats")
    @Operation(summary = "Get email statistics", description = "Get email sending statistics (Admin only)")
    public ResponseEntity<?> getEmailStats(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            if (userPrincipal.getRole() != com.ssn.faculty.entity.Role.MANAGER) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied. Admin privileges required.");
                return ResponseEntity.status(403).body(error);
            }
            
            // This would require additional service methods to implement
            Map<String, Object> stats = new HashMap<>();
            stats.put("message", "Email statistics feature coming soon");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get email statistics");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
