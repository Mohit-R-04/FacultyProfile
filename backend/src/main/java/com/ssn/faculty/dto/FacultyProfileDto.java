package com.ssn.faculty.dto;

import com.ssn.faculty.entity.Role;

import java.time.LocalDateTime;

public class FacultyProfileDto {
    
    private Long id;
    private Long userId;
    private String name;
    private String department;
    private String role;
    private String bio;
    private String profilePic;
    private String qualifications;
    private String dateOfJoining;
    private String experience;
    private String research;
    
    // Document fields
    private String tenthCert;
    private String twelfthCert;
    private String appointmentOrder;
    private String joiningReport;
    private String ugDegree;
    private String pgMsConsolidated;
    private String phdDegree;
    private String journalsList;
    private String conferencesList;
    private String auSupervisorLetter;
    private String fdpWorkshopsWebinars;
    private String nptelCoursera;
    private String invitedTalks;
    private String projectsSanction;
    private String consultancy;
    private String patent;
    private String communityCert;
    private String aadhar;
    private String pan;
    
    // Lock and edit request fields
    private Boolean isLocked;
    private LocalDateTime lockExpiry;
    private Boolean editRequested;
    
    // User information
    private String email;
    private String phoneNumber;
    private Role userRole;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public FacultyProfileDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getProfilePic() {
        return profilePic;
    }
    
    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }
    
    public String getQualifications() {
        return qualifications;
    }
    
    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }
    
    public String getDateOfJoining() {
        return dateOfJoining;
    }
    
    public void setDateOfJoining(String dateOfJoining) {
        this.dateOfJoining = dateOfJoining;
    }
    
    public String getExperience() {
        return experience;
    }
    
    public void setExperience(String experience) {
        this.experience = experience;
    }
    
    public String getResearch() {
        return research;
    }
    
    public void setResearch(String research) {
        this.research = research;
    }
    
    public String getTenthCert() {
        return tenthCert;
    }
    
    public void setTenthCert(String tenthCert) {
        this.tenthCert = tenthCert;
    }
    
    public String getTwelfthCert() {
        return twelfthCert;
    }
    
    public void setTwelfthCert(String twelfthCert) {
        this.twelfthCert = twelfthCert;
    }
    
    public String getAppointmentOrder() {
        return appointmentOrder;
    }
    
    public void setAppointmentOrder(String appointmentOrder) {
        this.appointmentOrder = appointmentOrder;
    }
    
    public String getJoiningReport() {
        return joiningReport;
    }
    
    public void setJoiningReport(String joiningReport) {
        this.joiningReport = joiningReport;
    }
    
    public String getUgDegree() {
        return ugDegree;
    }
    
    public void setUgDegree(String ugDegree) {
        this.ugDegree = ugDegree;
    }
    
    public String getPgMsConsolidated() {
        return pgMsConsolidated;
    }
    
    public void setPgMsConsolidated(String pgMsConsolidated) {
        this.pgMsConsolidated = pgMsConsolidated;
    }
    
    public String getPhdDegree() {
        return phdDegree;
    }
    
    public void setPhdDegree(String phdDegree) {
        this.phdDegree = phdDegree;
    }
    
    public String getJournalsList() {
        return journalsList;
    }
    
    public void setJournalsList(String journalsList) {
        this.journalsList = journalsList;
    }
    
    public String getConferencesList() {
        return conferencesList;
    }
    
    public void setConferencesList(String conferencesList) {
        this.conferencesList = conferencesList;
    }
    
    public String getAuSupervisorLetter() {
        return auSupervisorLetter;
    }
    
    public void setAuSupervisorLetter(String auSupervisorLetter) {
        this.auSupervisorLetter = auSupervisorLetter;
    }
    
    public String getFdpWorkshopsWebinars() {
        return fdpWorkshopsWebinars;
    }
    
    public void setFdpWorkshopsWebinars(String fdpWorkshopsWebinars) {
        this.fdpWorkshopsWebinars = fdpWorkshopsWebinars;
    }
    
    public String getNptelCoursera() {
        return nptelCoursera;
    }
    
    public void setNptelCoursera(String nptelCoursera) {
        this.nptelCoursera = nptelCoursera;
    }
    
    public String getInvitedTalks() {
        return invitedTalks;
    }
    
    public void setInvitedTalks(String invitedTalks) {
        this.invitedTalks = invitedTalks;
    }
    
    public String getProjectsSanction() {
        return projectsSanction;
    }
    
    public void setProjectsSanction(String projectsSanction) {
        this.projectsSanction = projectsSanction;
    }
    
    public String getConsultancy() {
        return consultancy;
    }
    
    public void setConsultancy(String consultancy) {
        this.consultancy = consultancy;
    }
    
    public String getPatent() {
        return patent;
    }
    
    public void setPatent(String patent) {
        this.patent = patent;
    }
    
    public String getCommunityCert() {
        return communityCert;
    }
    
    public void setCommunityCert(String communityCert) {
        this.communityCert = communityCert;
    }
    
    public String getAadhar() {
        return aadhar;
    }
    
    public void setAadhar(String aadhar) {
        this.aadhar = aadhar;
    }
    
    public String getPan() {
        return pan;
    }
    
    public void setPan(String pan) {
        this.pan = pan;
    }
    
    public Boolean getIsLocked() {
        return isLocked;
    }
    
    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }
    
    public LocalDateTime getLockExpiry() {
        return lockExpiry;
    }
    
    public void setLockExpiry(LocalDateTime lockExpiry) {
        this.lockExpiry = lockExpiry;
    }
    
    public Boolean getEditRequested() {
        return editRequested;
    }
    
    public void setEditRequested(Boolean editRequested) {
        this.editRequested = editRequested;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public Role getUserRole() {
        return userRole;
    }
    
    public void setUserRole(Role userRole) {
        this.userRole = userRole;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
