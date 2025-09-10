package com.ssn.faculty.service;

import com.ssn.faculty.dto.FacultyProfileDto;
import com.ssn.faculty.entity.FacultyProfile;
import com.ssn.faculty.entity.Role;
import com.ssn.faculty.entity.User;
import com.ssn.faculty.repository.FacultyProfileRepository;
import com.ssn.faculty.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FacultyProfileService {
    
    private static final Logger logger = LoggerFactory.getLogger(FacultyProfileService.class);
    
    @Autowired
    private FacultyProfileRepository profileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private EmailService emailService;
    
    public List<FacultyProfileDto> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<FacultyProfileDto> getProfileById(Long id) {
        return profileRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public Optional<FacultyProfileDto> getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(this::convertToDto);
    }
    
    public FacultyProfileDto createProfile(FacultyProfileDto profileDto, MultipartFile[] files) {
        User user = userRepository.findById(profileDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FacultyProfile profile = new FacultyProfile(user, profileDto.getName());
        profile.setDepartment(profileDto.getDepartment());
        profile.setRole(profileDto.getRole());
        profile.setBio(profileDto.getBio());
        profile.setQualifications(profileDto.getQualifications());
        profile.setDateOfJoining(profileDto.getDateOfJoining());
        profile.setExperience(profileDto.getExperience());
        profile.setResearch(profileDto.getResearch());
        
        // Handle file uploads
        if (files != null) {
            handleFileUploads(profile, files);
        }
        
        FacultyProfile savedProfile = profileRepository.save(profile);
        logger.info("Profile created successfully: {}", savedProfile.getName());
        
        return convertToDto(savedProfile);
    }
    
    public FacultyProfileDto updateProfile(Long id, FacultyProfileDto profileDto, MultipartFile[] files) {
        FacultyProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        // Check if profile is locked
        if (profile.getIsLocked() && profile.getLockExpiry() != null && 
            LocalDateTime.now().isBefore(profile.getLockExpiry())) {
            throw new RuntimeException("Profile is locked. Please request edit access from admin.");
        }
        
        try {
            // Update basic information
            if (profileDto.getName() != null) {
                profile.setName(profileDto.getName());
            }
            if (profileDto.getBio() != null) {
                profile.setBio(profileDto.getBio());
            }
            if (profileDto.getQualifications() != null) {
                profile.setQualifications(profileDto.getQualifications());
            }
            if (profileDto.getExperience() != null) {
                profile.setExperience(profileDto.getExperience());
            }
            if (profileDto.getResearch() != null) {
                profile.setResearch(profileDto.getResearch());
            }
            
            // Update user information if provided
            if (profileDto.getEmail() != null || profileDto.getPhoneNumber() != null) {
                User user = profile.getUser();
                if (profileDto.getEmail() != null && !profileDto.getEmail().trim().isEmpty()) {
                    if (userRepository.existsByEmail(profileDto.getEmail()) && 
                        !user.getEmail().equals(profileDto.getEmail())) {
                        throw new RuntimeException("Email already exists for another user");
                    }
                    user.setEmail(profileDto.getEmail());
                }
                if (profileDto.getPhoneNumber() != null) {
                    user.setPhoneNumber(profileDto.getPhoneNumber());
                }
                userRepository.save(user);
                logger.info("User information updated for profile: {}", profile.getName());
            }
            
            // Handle file uploads
            if (files != null && files.length > 0) {
                handleFileUploads(profile, files);
            }
            
            // Save the profile
            FacultyProfile savedProfile = profileRepository.save(profile);
            logger.info("Profile updated successfully: {} (ID: {})", savedProfile.getName(), savedProfile.getId());
            
            return convertToDto(savedProfile);
            
        } catch (Exception e) {
            logger.error("Failed to update profile: {}", profile.getName(), e);
            throw new RuntimeException("Failed to update profile: " + e.getMessage(), e);
        }
    }
    
    public void deleteProfile(Long id) {
        FacultyProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        // Delete associated files
        deleteProfileFiles(profile);
        
        profileRepository.delete(profile);
        logger.info("Profile deleted successfully: {}", profile.getName());
    }
    
    public void lockAllProfiles(boolean lock) {
        LocalDateTime expiry = lock ? LocalDateTime.now().plusHours(24) : null;
        List<FacultyProfile> profiles = profileRepository.findAll();
        
        for (FacultyProfile profile : profiles) {
            profile.setIsLocked(lock);
            profile.setLockExpiry(expiry);
        }
        
        profileRepository.saveAll(profiles);
        logger.info("All profiles {} successfully", lock ? "locked" : "unlocked");
    }
    
    public void lockProfile(Long id, boolean lock) {
        FacultyProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        profile.setIsLocked(lock);
        profile.setLockExpiry(lock ? LocalDateTime.now().plusHours(24) : null);
        
        profileRepository.save(profile);
        logger.info("Profile {} {} successfully", profile.getName(), lock ? "locked" : "unlocked");
    }
    
    public void requestEdit(Long profileId, Long userId) {
        FacultyProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (!profile.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Can only request edit for own profile");
        }
        
        profile.setEditRequested(true);
        profileRepository.save(profile);
        
        // Send notification to managers
        List<User> managers = userRepository.findByRole(Role.MANAGER);
        List<String> managerEmails = managers.stream()
                .map(User::getEmail)
                .collect(Collectors.toList());
        
        emailService.sendEditRequestNotification(
                managerEmails,
                profile.getName(),
                profile.getUser().getEmail(),
                profile.getDepartment()
        );
        
        logger.info("Edit request submitted for profile: {}", profile.getName());
    }
    
    public void approveEditRequest(Long profileId) {
        FacultyProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        profile.setEditRequested(false);
        profile.setIsLocked(false);
        profile.setLockExpiry(null);
        
        profileRepository.save(profile);
        logger.info("Edit request approved for profile: {}", profile.getName());
    }
    
    private void handleFileUploads(FacultyProfile profile, MultipartFile[] files) {
        if (files == null || files.length == 0) {
            logger.info("No files to upload for profile: {}", profile.getName());
            return;
        }
        
        logger.info("Processing {} files for profile: {}", files.length, profile.getName());
        
        // Map files to their respective fields based on parameter names
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) {
                    logger.warn("Skipping file with null filename");
                    continue;
                }
                
                try {
                    String filePath = fileStorageService.storeFile(file);
                    logger.info("File stored successfully: {} -> {}", originalFilename, filePath);
                    
                    // Map file to appropriate field based on filename or parameter name
                    String lowerFilename = originalFilename.toLowerCase();
                    boolean mapped = false;
                    
                    if (lowerFilename.contains("profile") || lowerFilename.contains("pic") || lowerFilename.contains("photo")) {
                        profile.setProfilePic(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("tenth") || lowerFilename.contains("10th")) {
                        profile.setTenthCert(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("twelfth") || lowerFilename.contains("12th")) {
                        profile.setTwelfthCert(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("appointment")) {
                        profile.setAppointmentOrder(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("joining")) {
                        profile.setJoiningReport(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("ug") || lowerFilename.contains("undergraduate")) {
                        profile.setUgDegree(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("pg") || lowerFilename.contains("ms") || lowerFilename.contains("postgraduate")) {
                        profile.setPgMsConsolidated(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("phd") || lowerFilename.contains("doctorate")) {
                        profile.setPhdDegree(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("journal")) {
                        profile.setJournalsList(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("conference")) {
                        profile.setConferencesList(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("supervisor")) {
                        profile.setAuSupervisorLetter(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("fdp") || lowerFilename.contains("workshop") || lowerFilename.contains("webinar")) {
                        profile.setFdpWorkshopsWebinars(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("nptel") || lowerFilename.contains("coursera")) {
                        profile.setNptelCoursera(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("invited") || lowerFilename.contains("talk")) {
                        profile.setInvitedTalks(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("project") || lowerFilename.contains("sanction")) {
                        profile.setProjectsSanction(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("consultancy")) {
                        profile.setConsultancy(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("patent")) {
                        profile.setPatent(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("community")) {
                        profile.setCommunityCert(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("aadhar")) {
                        profile.setAadhar(filePath);
                        mapped = true;
                    } else if (lowerFilename.contains("pan")) {
                        profile.setPan(filePath);
                        mapped = true;
                    }
                    
                    if (mapped) {
                        logger.info("File mapped to profile field: {} -> {}", originalFilename, filePath);
                    } else {
                        logger.warn("File could not be mapped to any profile field: {}", originalFilename);
                    }
                    
                } catch (Exception e) {
                    logger.error("Failed to store file: {}", originalFilename, e);
                    throw new RuntimeException("Failed to store file " + originalFilename + ": " + e.getMessage(), e);
                }
            }
        }
    }
    
    private void deleteProfileFiles(FacultyProfile profile) {
        // Delete all associated files
        fileStorageService.deleteFile(profile.getProfilePic());
        fileStorageService.deleteFile(profile.getTenthCert());
        fileStorageService.deleteFile(profile.getTwelfthCert());
        fileStorageService.deleteFile(profile.getAppointmentOrder());
        fileStorageService.deleteFile(profile.getJoiningReport());
        fileStorageService.deleteFile(profile.getUgDegree());
        fileStorageService.deleteFile(profile.getPgMsConsolidated());
        fileStorageService.deleteFile(profile.getPhdDegree());
        fileStorageService.deleteFile(profile.getJournalsList());
        fileStorageService.deleteFile(profile.getConferencesList());
        fileStorageService.deleteFile(profile.getAuSupervisorLetter());
        fileStorageService.deleteFile(profile.getFdpWorkshopsWebinars());
        fileStorageService.deleteFile(profile.getNptelCoursera());
        fileStorageService.deleteFile(profile.getInvitedTalks());
        fileStorageService.deleteFile(profile.getProjectsSanction());
        fileStorageService.deleteFile(profile.getConsultancy());
        fileStorageService.deleteFile(profile.getPatent());
        fileStorageService.deleteFile(profile.getCommunityCert());
        fileStorageService.deleteFile(profile.getAadhar());
        fileStorageService.deleteFile(profile.getPan());
    }
    
    private FacultyProfileDto convertToDto(FacultyProfile profile) {
        FacultyProfileDto dto = new FacultyProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setName(profile.getName());
        dto.setDepartment(profile.getDepartment());
        dto.setRole(profile.getRole());
        dto.setBio(profile.getBio());
        dto.setProfilePic(profile.getProfilePic());
        dto.setQualifications(profile.getQualifications());
        dto.setDateOfJoining(profile.getDateOfJoining());
        dto.setExperience(profile.getExperience());
        dto.setResearch(profile.getResearch());
        
        // Document fields
        dto.setTenthCert(profile.getTenthCert());
        dto.setTwelfthCert(profile.getTwelfthCert());
        dto.setAppointmentOrder(profile.getAppointmentOrder());
        dto.setJoiningReport(profile.getJoiningReport());
        dto.setUgDegree(profile.getUgDegree());
        dto.setPgMsConsolidated(profile.getPgMsConsolidated());
        dto.setPhdDegree(profile.getPhdDegree());
        dto.setJournalsList(profile.getJournalsList());
        dto.setConferencesList(profile.getConferencesList());
        dto.setAuSupervisorLetter(profile.getAuSupervisorLetter());
        dto.setFdpWorkshopsWebinars(profile.getFdpWorkshopsWebinars());
        dto.setNptelCoursera(profile.getNptelCoursera());
        dto.setInvitedTalks(profile.getInvitedTalks());
        dto.setProjectsSanction(profile.getProjectsSanction());
        dto.setConsultancy(profile.getConsultancy());
        dto.setPatent(profile.getPatent());
        dto.setCommunityCert(profile.getCommunityCert());
        dto.setAadhar(profile.getAadhar());
        dto.setPan(profile.getPan());
        
        // Lock and edit request fields
        dto.setIsLocked(profile.getIsLocked());
        dto.setLockExpiry(profile.getLockExpiry());
        dto.setEditRequested(profile.getEditRequested());
        
        // User information
        dto.setEmail(profile.getUser().getEmail());
        dto.setPhoneNumber(profile.getUser().getPhoneNumber());
        dto.setUserRole(profile.getUser().getRole());
        
        // Timestamps
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        
        return dto;
    }
}
