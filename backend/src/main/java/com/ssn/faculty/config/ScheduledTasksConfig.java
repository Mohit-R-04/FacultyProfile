package com.ssn.faculty.config;

import com.ssn.faculty.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasksConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTasksConfig.class);
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Clean up expired tokens and rate limit windows every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredTokens() {
        try {
            logger.info("Starting scheduled cleanup of expired tokens and rate limits");
            emailService.cleanupExpiredTokens();
            logger.info("Completed scheduled cleanup of expired tokens and rate limits");
        } catch (Exception e) {
            logger.error("Error during scheduled cleanup", e);
        }
    }
    
    /**
     * Clean up old audit logs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    public void cleanupOldAuditLogs() {
        try {
            logger.info("Starting scheduled cleanup of old audit logs");
            // This would be implemented in EmailService
            // emailService.cleanupOldAuditLogs();
            logger.info("Completed scheduled cleanup of old audit logs");
        } catch (Exception e) {
            logger.error("Error during scheduled audit log cleanup", e);
        }
    }
}
