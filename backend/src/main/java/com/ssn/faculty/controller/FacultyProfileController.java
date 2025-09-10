package com.ssn.faculty.controller;

import com.ssn.faculty.dto.FacultyProfileDto;
import com.ssn.faculty.dto.AddFacultyRequest;
import com.ssn.faculty.entity.Role;
import com.ssn.faculty.security.UserPrincipal;
import com.ssn.faculty.service.FacultyProfileService;
import com.ssn.faculty.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/profiles")
@Tag(name = "Faculty Profiles", description = "Faculty profile management APIs")
@SecurityRequirement(name = "bearerAuth")
public class FacultyProfileController {
    
    @Autowired
    private FacultyProfileService profileService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    @Operation(summary = "Get all profiles", description = "Retrieve all faculty profiles (public access)")
    public ResponseEntity<List<FacultyProfileDto>> getAllProfiles() {
        List<FacultyProfileDto> profiles = profileService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get profile by ID", description = "Retrieve a specific faculty profile by ID")
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        Optional<FacultyProfileDto> profile = profileService.getProfileById(id);
        if (profile.isPresent()) {
            return ResponseEntity.ok(profile.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Profile not found");
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/add-faculty")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Add new faculty member", description = "Create a new faculty member with user account and profile (Manager only)")
    public ResponseEntity<?> addFacultyMember(@RequestBody AddFacultyRequest request) {
        try {
            // Create faculty member with user account and profile
            var user = userService.createFacultyMember(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhoneNumber(),
                request.getDepartment(),
                request.getRole(),
                request.getBio(),
                request.getQualifications(),
                request.getExperience(),
                request.getResearch(),
                request.getDateOfJoining()
            );
            
            // Get the created profile
            Optional<FacultyProfileDto> createdProfile = profileService.getProfileById(user.getProfile().getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Faculty member added successfully");
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole()
            ));
            response.put("profile", createdProfile.orElse(null));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create new profile", description = "Create a new faculty profile (Manager only)")
    public ResponseEntity<?> createProfile(
            @RequestParam(value = "name") String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "qualifications", required = false) String qualifications,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "research", required = false) String research,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "userId") Long userId,
            @RequestParam(value = "files", required = false) MultipartFile[] files) {
        try {
            // Create DTO from individual parameters
            FacultyProfileDto profileDto = new FacultyProfileDto();
            profileDto.setName(name);
            profileDto.setBio(bio);
            profileDto.setQualifications(qualifications);
            profileDto.setExperience(experience);
            profileDto.setResearch(research);
            profileDto.setEmail(email);
            profileDto.setPhoneNumber(phoneNumber);
            profileDto.setUserId(userId);
            
            FacultyProfileDto createdProfile = profileService.createProfile(profileDto, files);
            return ResponseEntity.ok(createdProfile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update profile", description = "Update an existing faculty profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "qualifications", required = false) String qualifications,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "research", required = false) String research,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Check if user can edit this profile
            Optional<FacultyProfileDto> existingProfile = profileService.getProfileById(id);
            if (existingProfile.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Profile not found");
                return ResponseEntity.notFound().build();
            }
            
            // Allow managers to edit any profile, or users to edit their own profile
            if (userPrincipal.getRole() != Role.MANAGER && 
                !existingProfile.get().getUserId().equals(userPrincipal.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized: Can only edit own profile");
                return ResponseEntity.status(403).body(error);
            }
            
            // Create DTO from individual parameters
            FacultyProfileDto profileDto = new FacultyProfileDto();
            profileDto.setName(name);
            profileDto.setBio(bio);
            profileDto.setQualifications(qualifications);
            profileDto.setExperience(experience);
            profileDto.setResearch(research);
            profileDto.setEmail(email);
            profileDto.setPhoneNumber(phoneNumber);
            
            FacultyProfileDto updatedProfile = profileService.updateProfile(id, profileDto, files);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete profile", description = "Delete a faculty profile")
    public ResponseEntity<?> deleteProfile(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Check if user can delete this profile
            Optional<FacultyProfileDto> existingProfile = profileService.getProfileById(id);
            if (existingProfile.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Profile not found");
                return ResponseEntity.notFound().build();
            }
            
            // Allow managers to delete any profile, or users to delete their own profile
            if (userPrincipal.getRole() != Role.MANAGER && 
                !existingProfile.get().getUserId().equals(userPrincipal.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized: Can only delete own profile");
                return ResponseEntity.status(403).body(error);
            }
            
            profileService.deleteProfile(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/lock-all")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Lock/Unlock all profiles", description = "Lock or unlock all faculty profiles (Manager only)")
    public ResponseEntity<?> lockAllProfiles(@RequestBody Map<String, Boolean> request) {
        try {
            Boolean lock = request.get("lock");
            profileService.lockAllProfiles(lock);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "All profiles " + (lock ? "locked" : "unlocked") + " successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{id}/lock")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Lock/Unlock profile", description = "Lock or unlock a specific faculty profile (Manager only)")
    public ResponseEntity<?> lockProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean lock = request.get("lock");
            profileService.lockProfile(id, lock);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile " + (lock ? "locked" : "unlocked") + " successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{id}/request-edit")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Request edit access", description = "Request edit access for a locked profile (Staff only)")
    public ResponseEntity<?> requestEdit(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            profileService.requestEdit(id, userPrincipal.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Edit request submitted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{id}/approve-edit")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Approve edit request", description = "Approve edit request and unlock profile (Manager only)")
    public ResponseEntity<?> approveEditRequest(@PathVariable Long id) {
        try {
            profileService.approveEditRequest(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Edit request approved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
