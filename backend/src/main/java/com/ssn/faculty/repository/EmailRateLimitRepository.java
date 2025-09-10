package com.ssn.faculty.repository;

import com.ssn.faculty.entity.EmailRateLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailRateLimitRepository extends JpaRepository<EmailRateLimit, Long> {
    
    Optional<EmailRateLimit> findByIdentifierAndIdentifierTypeAndEmailType(
            String identifier, String identifierType, String emailType);
    
    @Modifying
    @Query("DELETE FROM EmailRateLimit e WHERE e.windowStart < :cutoffTime")
    void deleteExpiredWindows(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    @Query("SELECT COUNT(e) FROM EmailRateLimit e WHERE e.identifier = :identifier AND e.identifierType = :identifierType AND e.windowStart > :since")
    long countByIdentifierSince(@Param("identifier") String identifier, 
                               @Param("identifierType") String identifierType, 
                               @Param("since") LocalDateTime since);
}
