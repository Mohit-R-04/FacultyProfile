package com.ssn.faculty.service;

import com.ssn.faculty.dto.LoginRequest;
import com.ssn.faculty.dto.LoginResponse;
import com.ssn.faculty.entity.Role;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.entity.FacultyProfile;
import com.ssn.faculty.repository.UserRepository;
import com.ssn.faculty.security.JwtUtils;
import com.ssn.faculty.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private EmailService emailService;
    
    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        
        return new LoginResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getProfile() != null ? user.getProfile().getName() : null,
                user.getProfile() != null ? user.getProfile().getId() : null,
                user.getProfile() != null ? user.getProfile().getIsLocked() : false
        );
    }
    
    public User createUser(String email, String password, String phoneNumber, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already in use!");
        }
        
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        logger.info("User created successfully: {}", email);
        
        return savedUser;
    }
    
    public User createUserWithProfile(String email, String password, String phoneNumber, String name) {
        User user = createUser(email, password, phoneNumber, Role.STAFF);
        
        // Create profile for the user
        FacultyProfile profile = new FacultyProfile(user, name);
        user.setProfile(profile);
        
        User savedUser = userRepository.save(user);
        
        // Send registration email
        emailService.sendRegistrationEmail(email, name, password);
        
        return savedUser;
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
        logger.info("User deleted: {}", id);
    }
}
