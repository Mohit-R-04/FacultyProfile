package com.ssn.faculty.repository;

import com.ssn.faculty.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}


