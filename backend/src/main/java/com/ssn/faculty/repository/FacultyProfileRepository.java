package com.ssn.faculty.repository;

import com.ssn.faculty.entity.FacultyProfile;
import com.ssn.faculty.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    Optional<FacultyProfile> findByUser(User user);
    Optional<FacultyProfile> findByUserId(Long userId);
    List<FacultyProfile> findByDepartment(String department);
    
    @Query("SELECT fp FROM FacultyProfile fp WHERE fp.isLocked = :isLocked")
    List<FacultyProfile> findByLockStatus(@Param("isLocked") Boolean isLocked);
    
    @Query("SELECT fp FROM FacultyProfile fp WHERE fp.editRequested = :editRequested")
    List<FacultyProfile> findByEditRequested(@Param("editRequested") Boolean editRequested);
}
