package com.ssn.faculty.config;

import com.ssn.faculty.entity.Role;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.entity.FacultyProfile;
import com.ssn.faculty.repository.UserRepository;
import com.ssn.faculty.repository.FacultyProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DataInitializer: Starting data initialization...");
        System.out.println("DataInitializer: Current user count: " + userRepository.count());
        
        // Check if users already exist
        if (userRepository.count() == 0) {
            // Create admin user
            User admin = new User();
            admin.setEmail("admin@ssn.edu.in");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhoneNumber("1234567890");
            admin.setRole(Role.MANAGER);
            admin.setIsActive(true);
            userRepository.save(admin);

            // Create staff user
            User staff = new User();
            staff.setEmail("mike.lee@ssn.edu.in");
            staff.setPassword(passwordEncoder.encode("mike789"));
            staff.setPhoneNumber("4445556666");
            staff.setRole(Role.STAFF);
            staff.setIsActive(true);
            userRepository.save(staff);

            // Create sample profile for staff
            FacultyProfile profile = new FacultyProfile();
            profile.setUser(staff);
            profile.setName("Dr. Mike Lee");
            profile.setDepartment("IT");
            profile.setRole("Assistant Professor");
            profile.setBio("Information Technology Specialist with expertise in software engineering and database systems.");
            profile.setQualifications("PhD in Computer Science, MSc in Information Technology");
            profile.setExperience("5 years teaching experience in computer science");
            profile.setResearch("Machine Learning, Database Systems, Software Engineering");
            profileRepository.save(profile);

            System.out.println("Initial data created successfully!");
            System.out.println("Admin: admin@ssn.edu.in / admin123");
            System.out.println("Staff: mike.lee@ssn.edu.in / mike789");
        } else {
            System.out.println("DataInitializer: Users already exist, skipping initialization");
        }
    }
}
