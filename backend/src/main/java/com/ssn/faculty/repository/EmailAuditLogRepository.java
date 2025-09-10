package com.ssn.faculty.repository;

import com.ssn.faculty.entity.EmailAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailAuditLogRepository extends JpaRepository<EmailAuditLog, Long> {
    
    Page<EmailAuditLog> findByRecipientEmail(String recipientEmail, Pageable pageable);
    
    Page<EmailAuditLog> findByEmailType(String emailType, Pageable pageable);
    
    Page<EmailAuditLog> findByStatus(String status, Pageable pageable);
    
    @Query("SELECT e FROM EmailAuditLog e WHERE e.sentAt BETWEEN :startDate AND :endDate")
    Page<EmailAuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate, 
                                       Pageable pageable);
    
    @Query("SELECT COUNT(e) FROM EmailAuditLog e WHERE e.recipientEmail = :email AND e.sentAt > :since")
    long countByRecipientEmailSince(@Param("email") String email, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(e) FROM EmailAuditLog e WHERE e.ipAddress = :ipAddress AND e.sentAt > :since")
    long countByIpAddressSince(@Param("ipAddress") String ipAddress, @Param("since") LocalDateTime since);
    
    @Modifying
    @Query("DELETE FROM EmailAuditLog e WHERE e.sentAt < :cutoffDate")
    void deleteOldLogs(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("SELECT e.emailType, COUNT(e) FROM EmailAuditLog e WHERE e.sentAt > :since GROUP BY e.emailType")
    List<Object[]> getEmailTypeStats(@Param("since") LocalDateTime since);
}
