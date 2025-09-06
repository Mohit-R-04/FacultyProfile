package com.ssn.faculty.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_profiles")
public class FacultyProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String department = "IT";
    
    @Column
    private String role = "Assistant Professor";
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "profile_pic")
    private String profilePic;
    
    @Column(columnDefinition = "TEXT")
    private String qualifications;
    
    @Column(name = "date_of_joining")
    private String dateOfJoining;
    
    @Column(columnDefinition = "TEXT")
    private String experience;
    
    @Column(columnDefinition = "TEXT")
    private String research;
    
    // Document fields
    @Column(name = "tenth_cert")
    private String tenthCert;
    
    @Column(name = "twelfth_cert")
    private String twelfthCert;
    
    @Column(name = "appointment_order")
    private String appointmentOrder;
    
    @Column(name = "joining_report")
    private String joiningReport;
    
    @Column(name = "ug_degree")
    private String ugDegree;
    
    @Column(name = "pg_ms_consolidated")
    private String pgMsConsolidated;
    
    @Column(name = "phd_degree")
    private String phdDegree;
    
    @Column(name = "journals_list")
    private String journalsList;
    
    @Column(name = "conferences_list")
    private String conferencesList;
    
    @Column(name = "au_supervisor_letter")
    private String auSupervisorLetter;
    
    @Column(name = "fdp_workshops_webinars")
    private String fdpWorkshopsWebinars;
    
    @Column(name = "nptel_coursera")
    private String nptelCoursera;
    
    @Column(name = "invited_talks")
    private String invitedTalks;
    
    @Column(name = "projects_sanction")
    private String projectsSanction;
    
    @Column(name = "consultancy")
    private String consultancy;
    
    @Column(name = "patent")
    private String patent;
    
    @Column(name = "community_cert")
    private String communityCert;
    
    @Column(name = "aadhar")
    private String aadhar;
    
    @Column(name = "pan")
    private String pan;
    
    // Lock and edit request fields
    @Column(name = "is_locked")
    private Boolean isLocked = false;
    
    @Column(name = "lock_expiry")
    private LocalDateTime lockExpiry;
    
    @Column(name = "edit_requested")
    private Boolean editRequested = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public FacultyProfile() {}
    
    public FacultyProfile(User user, String name) {
        this.user = user;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
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
