package com.ssn.faculty.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_rate_limits")
public class EmailRateLimit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "identifier", nullable = false)
    private String identifier; // email or IP address
    
    @Column(name = "identifier_type", nullable = false)
    private String identifierType; // EMAIL or IP
    
    @Column(name = "email_type", nullable = false)
    private String emailType; // VERIFICATION, RESET, NOTIFICATION
    
    @Column(name = "count", nullable = false)
    private Integer count = 0;
    
    @Column(name = "window_start", nullable = false)
    private LocalDateTime windowStart;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public EmailRateLimit() {}
    
    public EmailRateLimit(String identifier, String identifierType, String emailType, LocalDateTime windowStart) {
        this.identifier = identifier;
        this.identifierType = identifierType;
        this.emailType = emailType;
        this.windowStart = windowStart;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getIdentifier() {
        return identifier;
    }
    
    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
    
    public String getIdentifierType() {
        return identifierType;
    }
    
    public void setIdentifierType(String identifierType) {
        this.identifierType = identifierType;
    }
    
    public String getEmailType() {
        return emailType;
    }
    
    public void setEmailType(String emailType) {
        this.emailType = emailType;
    }
    
    public Integer getCount() {
        return count;
    }
    
    public void setCount(Integer count) {
        this.count = count;
    }
    
    public LocalDateTime getWindowStart() {
        return windowStart;
    }
    
    public void setWindowStart(LocalDateTime windowStart) {
        this.windowStart = windowStart;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public void incrementCount() {
        this.count++;
    }
    
    public boolean isWindowExpired(int windowMinutes) {
        return LocalDateTime.now().isAfter(windowStart.plusMinutes(windowMinutes));
    }
}
