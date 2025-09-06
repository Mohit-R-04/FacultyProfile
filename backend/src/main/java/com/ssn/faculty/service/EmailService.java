package com.ssn.faculty.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
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
}
