package com.ssn.faculty.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_otps")
public class EmailOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public EmailOtp() {}

    public EmailOtp(User user, String otpCode, LocalDateTime expiresAt) {
        this.user = user;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }
}


