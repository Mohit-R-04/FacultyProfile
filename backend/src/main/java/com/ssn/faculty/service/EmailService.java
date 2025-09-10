package com.ssn.faculty.service;

import com.ssn.faculty.entity.EmailVerificationToken;
import com.ssn.faculty.entity.EmailOtp;
import com.ssn.faculty.entity.PasswordResetToken;
import com.ssn.faculty.entity.EmailAuditLog;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.repository.EmailVerificationTokenRepository;
import com.ssn.faculty.repository.EmailOtpRepository;
import com.ssn.faculty.repository.PasswordResetTokenRepository;
import com.ssn.faculty.repository.EmailAuditLogRepository;
import com.ssn.faculty.repository.EmailRateLimitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private EmailVerificationTokenRepository tokenRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private EmailAuditLogRepository auditLogRepository;
    
    @Autowired
    private EmailRateLimitRepository rateLimitRepository;
    
    @Autowired
    private EmailOtpRepository emailOtpRepository;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;
    
    @Value("${email.verification.expiry-hours:24}")
    private int verificationExpiryHours;
    
    @Value("${email.password-reset.expiry-hours:1}")
    private int passwordResetExpiryHours;
    
    @Value("${email.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;
    
    @Value("${email.rate-limit.per-hour:10}")
    private int rateLimitPerHour;
    
    @Value("${email.rate-limit.per-day:50}")
    private int rateLimitPerDay;
    
    @Async
    public void sendRegistrationEmail(String toEmail, String name, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to SSN Faculty Profile System");
            
            String htmlContent = createRegistrationEmailContent(name, toEmail, password);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Registration email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send registration email to: {}", toEmail, e);
        }
    }
    
    @Async
    public void sendEditRequestNotification(List<String> managerEmails, String facultyName, String facultyEmail, String department) {
        try {
            for (String managerEmail : managerEmails) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromEmail);
                helper.setTo(managerEmail);
                helper.setSubject("New Faculty Profile Edit Request");
                
                String htmlContent = createEditRequestEmailContent(facultyName, facultyEmail, department);
                helper.setText(htmlContent, true);
                
                mailSender.send(message);
                logger.info("Edit request notification sent to manager: {}", managerEmail);
            }
        } catch (MessagingException e) {
            logger.error("Failed to send edit request notification", e);
        }
    }
    
    @Transactional
    public EmailVerificationToken createVerificationToken(User user) {
        // Delete any existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());
        
        // Generate secure token
        String token = generateSecureToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(verificationExpiryHours);
        
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user, expiresAt);
        return tokenRepository.save(verificationToken);
    }
    
    @Async
    public void sendVerificationEmail(User user) {
        try {
            EmailVerificationToken token = createVerificationToken(user);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Verify Your Email - SSN Faculty Profile System");
            
            String verificationUrl = baseUrl + "/verify-email?token=" + token.getToken();
            String name = user.getProfile() != null ? user.getProfile().getName() : user.getEmail();
            String htmlContent = createVerificationEmailContent(name, verificationUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Verification email sent successfully to: {}", user.getEmail());
            
        } catch (MessagingException e) {
            logger.error("Failed to send verification email to: {}", user.getEmail(), e);
        }
    }

    // OTP for email verification
    @Transactional
    public EmailOtp createOrRefreshOtp(User user) {
        emailOtpRepository.deleteByUserId(user.getId());
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
        EmailOtp emailOtp = new EmailOtp(user, otp, expiresAt);
        return emailOtpRepository.save(emailOtp);
    }

    @Async
    public void sendVerificationOtp(User user) {
        try {
            EmailOtp otp = createOrRefreshOtp(user);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Your SSN Faculty Profile OTP");
            String name = user.getProfile() != null ? user.getProfile().getName() : user.getEmail();
            String htmlContent = String.format("""
                <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
                    <h2 style=\"color: #2c3e50;\">Email Verification OTP</h2>
                    <p>Dear %s,</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <div style=\"background:#f1f5f9; padding:16px; border-radius:8px; text-align:center; font-size:28px; letter-spacing:6px; font-weight:bold;\">%s</div>
                    <p style=\"color:#64748b;\">This OTP will expire in %d minutes.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                </div>
            """, name, otp.getOtpCode(), otpExpiryMinutes);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("OTP email sent to {}", user.getEmail());
        } catch (MessagingException e) {
            logger.error("Failed to send OTP to {}", user.getEmail(), e);
        }
    }

    @Transactional
    public boolean verifyOtp(User user, String otpCode) {
        EmailOtp emailOtp = emailOtpRepository.findByUserId(user.getId()).orElse(null);
        if (emailOtp == null) return false;
        if (emailOtp.isExpired()) {
            emailOtpRepository.delete(emailOtp);
            return false;
        }
        boolean match = emailOtp.getOtpCode().equals(otpCode);
        if (match) {
            emailOtpRepository.delete(emailOtp);
            user.setIsEmailVerified(true);
        }
        return match;
    }
    
    @Transactional
    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElse(null);
        
        if (verificationToken == null) {
            logger.warn("Invalid verification token: {}", token);
            return false;
        }
        
        if (verificationToken.isExpired()) {
            logger.warn("Expired verification token: {}", token);
            tokenRepository.delete(verificationToken);
            return false;
        }
        
        // Mark user as email verified
        User user = verificationToken.getUser();
        user.setIsActive(true); // Activate user account
        
        // Delete the used token
        tokenRepository.delete(verificationToken);
        
        logger.info("Email verified successfully for user: {}", user.getEmail());
        return true;
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        rateLimitRepository.deleteExpiredWindows(LocalDateTime.now().minusHours(24));
        logger.info("Cleaned up expired tokens and rate limit windows");
    }
    
    // Password Reset Functionality
    @Transactional
    public PasswordResetToken createPasswordResetToken(User user) {
        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());
        
        // Check rate limiting
        if (!checkRateLimit(user.getEmail(), "EMAIL", "PASSWORD_RESET")) {
            throw new RuntimeException("Rate limit exceeded for password reset requests");
        }
        
        // Generate secure token
        String token = generateSecureToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(passwordResetExpiryHours);
        
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiresAt);
        return passwordResetTokenRepository.save(resetToken);
    }
    
    @Async
    public void sendPasswordResetEmail(User user, HttpServletRequest request) {
        try {
            PasswordResetToken token = createPasswordResetToken(user);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset Request - SSN Faculty Profile System");
            
            String resetUrl = baseUrl + "/reset-password?token=" + token.getToken();
            String name = user.getProfile() != null ? user.getProfile().getName() : user.getEmail();
            String htmlContent = createPasswordResetEmailContent(name, resetUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            // Log successful email
            logEmailActivity(user, "PASSWORD_RESET", user.getEmail(), "SENT", 
                           getClientIpAddress(request), getUserAgent(request));
            
            logger.info("Password reset email sent successfully to: {}", user.getEmail());
            
        } catch (MessagingException e) {
            // Log failed email
            logEmailActivity(user, "PASSWORD_RESET", user.getEmail(), "FAILED", 
                           getClientIpAddress(request), getUserAgent(request), e.getMessage());
            logger.error("Failed to send password reset email to: {}", user.getEmail(), e);
        }
    }
    
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElse(null);
        
        if (resetToken == null) {
            logger.warn("Invalid password reset token: {}", token);
            return false;
        }
        
        if (!resetToken.isValid()) {
            logger.warn("Invalid or expired password reset token: {}", token);
            if (resetToken.isExpired()) {
                passwordResetTokenRepository.delete(resetToken);
            }
            return false;
        }
        
        // Update password
        User user = resetToken.getUser();
        // Note: Password encoding should be handled by UserService
        // user.setPassword(passwordEncoder.encode(newPassword));
        
        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        
        logger.info("Password reset successfully for user: {}", user.getEmail());
        return true;
    }
    
    // Rate Limiting Functionality
    public boolean checkRateLimit(String identifier, String identifierType, String emailType) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime hourAgo = now.minusHours(1);
        LocalDateTime dayAgo = now.minusDays(1);
        
        // Check hourly limit
        long hourlyCount = auditLogRepository.countByRecipientEmailSince(identifier, hourAgo);
        if (hourlyCount >= rateLimitPerHour) {
            logger.warn("Hourly rate limit exceeded for {}: {}", identifierType, identifier);
            return false;
        }
        
        // Check daily limit
        long dailyCount = auditLogRepository.countByRecipientEmailSince(identifier, dayAgo);
        if (dailyCount >= rateLimitPerDay) {
            logger.warn("Daily rate limit exceeded for {}: {}", identifierType, identifier);
            return false;
        }
        
        return true;
    }
    
    public boolean checkIpRateLimit(String ipAddress, String emailType) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime hourAgo = now.minusHours(1);
        
        // Check IP-based hourly limit (more restrictive)
        long hourlyCount = auditLogRepository.countByIpAddressSince(ipAddress, hourAgo);
        if (hourlyCount >= (rateLimitPerHour * 2)) { // Double the limit for IP
            logger.warn("IP rate limit exceeded for: {}", ipAddress);
            return false;
        }
        
        return true;
    }
    
    // Email Audit Logging
    @Transactional
    public void logEmailActivity(User user, String emailType, String recipientEmail, 
                                String status, String ipAddress, String userAgent) {
        logEmailActivity(user, emailType, recipientEmail, status, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logEmailActivity(User user, String emailType, String recipientEmail, 
                                String status, String ipAddress, String userAgent, String errorMessage) {
        EmailAuditLog auditLog = new EmailAuditLog(user, emailType, recipientEmail, status);
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setErrorMessage(errorMessage);
        auditLogRepository.save(auditLog);
    }
    
    // Utility methods
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    
    private String getUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }
    
    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    
    private String createRegistrationEmailContent(String name, String email, String password) {
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Welcome to SSN Faculty Profile System</h2>
                <p>Dear %s,</p>
                <p>Your faculty profile has been created in the SSN Faculty Profile System.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Login Details:</h3>
                    <p><strong>Email:</strong> %s</p>
                    <p><strong>Password:</strong> %s</p>
                </div>
                <p>Please login to complete your profile setup.</p>
                <p>Best regards,<br>SSN Faculty Profile System</p>
            </div>
            """, name, email, password);
    }
    
    private String createEditRequestEmailContent(String facultyName, String facultyEmail, String department) {
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">New Faculty Profile Edit Request</h2>
                <p>A new edit request has been submitted:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Faculty Name:</strong> %s</p>
                    <p><strong>Faculty Email:</strong> %s</p>
                    <p><strong>Department:</strong> %s</p>
                </div>
                <p>Please review the request in the faculty management system.</p>
                <p>Best regards,<br>SSN Faculty Profile System</p>
            </div>
            """, facultyName, facultyEmail, department);
    }
    
    private String createVerificationEmailContent(String name, String verificationUrl) {
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Verify Your Email Address</h2>
                <p>Dear %s,</p>
                <p>Thank you for registering with the SSN Faculty Profile System. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">%s</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                        <strong>Note:</strong> This verification link will expire in 24 hours for security reasons.
                    </p>
                </div>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
                <p>Best regards,<br>SSN Faculty Profile System</p>
            </div>
            """, name, verificationUrl, verificationUrl);
    }
    
    private String createPasswordResetEmailContent(String name, String resetUrl) {
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Password Reset Request</h2>
                <p>Dear %s,</p>
                <p>We received a request to reset your password for your SSN Faculty Profile System account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">%s</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                        <strong>Important Security Information:</strong>
                    </p>
                    <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; color: #666;">
                        <li>This link will expire in 1 hour for security reasons</li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Your password will not be changed until you click the link above</li>
                    </ul>
                </div>
                
                <p>If you have any concerns about this request, please contact the system administrator immediately.</p>
                <p>Best regards,<br>SSN Faculty Profile System</p>
            </div>
            """, name, resetUrl, resetUrl);
    }
}
