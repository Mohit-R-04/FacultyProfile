package com.ssn.faculty.controller;

import com.ssn.faculty.entity.Role;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.repository.UserRepository;
import com.ssn.faculty.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Admin approval APIs")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    private boolean isManager(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userPrincipal.getRole() == Role.MANAGER;
    }

    @GetMapping("/pending-users")
    @Operation(summary = "List users pending approval")
    public ResponseEntity<?> listPending(Authentication authentication) {
        if (!isManager(authentication)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        List<User> users = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsEmailVerified()) && Boolean.FALSE.equals(u.getIsApproved()))
                .toList();
        return ResponseEntity.ok(users.stream().map(u -> Map.of(
                "id", u.getId(),
                "email", u.getEmail()
        )));
    }

    @PostMapping("/approve-user/{id}")
    @Operation(summary = "Approve a user")
    public ResponseEntity<?> approve(Authentication authentication, @PathVariable Long id) {
        if (!isManager(authentication)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        user.setIsApproved(true);
        userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User approved");
        return ResponseEntity.ok(response);
    }
}


