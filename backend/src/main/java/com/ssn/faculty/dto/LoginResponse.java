package com.ssn.faculty.dto;

import com.ssn.faculty.entity.Role;

public class LoginResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private Role role;
    private String name;
    private Long profileId;
    private Boolean isLocked;
    
    // Constructors
    public LoginResponse() {}
    
    public LoginResponse(String token, Long id, String email, Role role, String name, Long profileId, Boolean isLocked) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
        this.name = name;
        this.profileId = profileId;
        this.isLocked = isLocked;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getProfileId() {
        return profileId;
    }
    
    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }
    
    public Boolean getIsLocked() {
        return isLocked;
    }
    
    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }
}
