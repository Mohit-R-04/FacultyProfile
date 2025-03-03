const API_URL =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";
const { jsPDF } = window.jspdf;

// DOM Elements
const elements = {
  themeToggle: document.getElementById("theme-toggle"),
  loginBtn: document.getElementById("login-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  userStatus: document.getElementById("user-status"),
  loginModal: document.getElementById("login-modal"),
  loginForm: document.getElementById("login-form"),
  closeLogin: document.getElementById("close-login"),
  backBtn: document.getElementById("back-btn"),
  facultyPic: document.getElementById("faculty-pic"),
  facultyName: document.getElementById("faculty-name"),
  facultyBio: document.getElementById("faculty-bio"),
  facultyResearch: document.getElementById("faculty-research"),
  facultyQual: document.getElementById("faculty-qual"),
  facultyExp: document.getElementById("faculty-exp"),
  facultyTenthCert: document.getElementById("faculty-tenth-cert"),
  facultyTwelfthCert: document.getElementById("faculty-twelfth-cert"),
  facultyAppointmentOrder: document.getElementById("faculty-appointment-order"),
  facultyJoiningReport: document.getElementById("faculty-joining-report"),
  facultyUgDegree: document.getElementById("faculty-ug-degree"),
  facultyPgMsConsolidated: document.getElementById(
    "faculty-pg-ms-consolidated"
  ),
  facultyPhdDegree: document.getElementById("faculty-phd-degree"),
  facultyJournalsList: document.getElementById("faculty-journals-list"),
  facultyConferencesList: document.getElementById("faculty-conferences-list"),
  facultyAuSupervisorLetter: document.getElementById(
    "faculty-au-supervisor-letter"
  ),
  facultyFdpWorkshopsWebinars: document.getElementById(
    "faculty-fdp-workshops-webinars"
  ),
  facultyNptelCoursera: document.getElementById("faculty-nptel-coursera"),
  facultyInvitedTalks: document.getElementById("faculty-invited-talks"),
  facultyProjectsSanction: document.getElementById("faculty-projects-sanction"),
  facultyConsultancy: document.getElementById("faculty-consultancy"),
  facultyPatent: document.getElementById("faculty-patent"),
  facultyCommunityCert: document.getElementById("faculty-community-cert"),
  facultyAadhar: document.getElementById("faculty-aadhar"),
  facultyPan: document.getElementById("faculty-pan"),
  editBtn: document.getElementById("edit-btn"),
  editModal: document.getElementById("edit-modal"),
  editTitle: document.getElementById("edit-title"),
  profileForm: document.getElementById("profile-form"),
  exportPdf: document.getElementById("export-pdf"),
  closeEdit: document.getElementById("close-edit"),
  toastContainer: document.getElementById("toast-container"),
};

// State Variables
let currentUser = null;
let facultyId = null;
let currentProfile = null;
let toastTimeouts = [];

const urlParams = new URLSearchParams(window.location.search);
facultyId = urlParams.get("id");
console.log("Faculty ID from URL:", facultyId);

// Utility Functions
const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${
    type === "success" ? "check-circle" : "exclamation-circle"
  }"></i> ${message}`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  const timeout = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
  toastTimeouts.push(timeout);
};

// Validate Token
async function validateToken(token) {
  if (!token || !facultyId) return false;
  try {
    const res = await fetch(`${API_URL}/profiles/${facultyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Token validation failed");
    return true;
  } catch (err) {
    console.error("Token validation error:", err);
    return false;
  }
}

// Theme Management
if (elements.themeToggle) {
  elements.themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-theme", elements.themeToggle.checked);
    localStorage.setItem(
      "theme",
      elements.themeToggle.checked ? "dark" : "light"
    );
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    elements.themeToggle.checked = true;
  }
}

// Authentication
if (elements.loginBtn)
  elements.loginBtn.addEventListener("click", () =>
    elements.loginModal.classList.remove("hidden")
  );
if (elements.closeLogin)
  elements.closeLogin.addEventListener("click", () =>
    elements.loginModal.classList.add("hidden")
  );

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    elements.loginBtn.classList.remove("hidden");
    elements.logoutBtn.classList.add("hidden");
    elements.userStatus.innerHTML = "";
    elements.editBtn.classList.add("hidden");
    loadFacultyProfile();
    showToast("Logged out successfully");
  });
}

if (elements.loginForm) {
  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.loginForm.email.value;
    const password = elements.loginForm.password.value;
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.user.email);
        elements.loginModal.classList.add("hidden");
        elements.loginBtn.classList.add("hidden");
        elements.logoutBtn.classList.remove("hidden");
        elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
        loadFacultyProfile();
        showToast(`Welcome, ${currentUser.email}!`);
      } else {
        showToast("Login failed: " + data.message, "error");
      }
    } catch (err) {
      showToast("Server error during login: " + err.message, "error");
      console.error(err);
    }
  });
}

// Load Faculty Profile
async function loadFacultyProfile() {
  if (!facultyId || facultyId === "undefined") {
    showToast("No valid faculty ID provided in URL", "error");
    console.error("No valid faculty ID provided in URL:", facultyId);
    if (elements.facultyName)
      elements.facultyName.textContent = "Invalid Profile";
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/profiles/${facultyId}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch profile: ${res.status} - ${errorText}`);
    }
    currentProfile = await res.json();
    console.log("Fetched faculty profile:", currentProfile);

    if (elements.facultyPic)
      elements.facultyPic.src = currentProfile.profile_pic
        ? `${API_URL}${currentProfile.profile_pic}?t=${Date.now()}`
        : "https://via.placeholder.com/150";
    if (elements.facultyName)
      elements.facultyName.textContent = currentProfile.name || "Unknown";
    if (elements.facultyBio)
      elements.facultyBio.textContent = currentProfile.bio || "Not provided";
    if (elements.facultyResearch)
      elements.facultyResearch.textContent =
        currentProfile.research || "Not provided";
    if (elements.facultyQual)
      elements.facultyQual.textContent =
        currentProfile.qualifications || "Not provided";
    if (elements.facultyExp)
      elements.facultyExp.textContent =
        currentProfile.experience || "Not provided";
    if (elements.facultyTenthCert)
      elements.facultyTenthCert.href = currentProfile.tenth_cert
        ? `${API_URL}${currentProfile.tenth_cert}`
        : "#";
    if (elements.facultyTwelfthCert)
      elements.facultyTwelfthCert.href = currentProfile.twelfth_cert
        ? `${API_URL}${currentProfile.twelfth_cert}`
        : "#";
    if (elements.facultyAppointmentOrder)
      elements.facultyAppointmentOrder.href = currentProfile.appointment_order
        ? `${API_URL}${currentProfile.appointment_order}`
        : "#";
    if (elements.facultyJoiningReport)
      elements.facultyJoiningReport.href = currentProfile.joining_report
        ? `${API_URL}${currentProfile.joining_report}`
        : "#";
    if (elements.facultyUgDegree)
      elements.facultyUgDegree.href = currentProfile.ug_degree
        ? `${API_URL}${currentProfile.ug_degree}`
        : "#";
    if (elements.facultyPgMsConsolidated)
      elements.facultyPgMsConsolidated.href = currentProfile.pg_ms_consolidated
        ? `${API_URL}${currentProfile.pg_ms_consolidated}`
        : "#";
    if (elements.facultyPhdDegree)
      elements.facultyPhdDegree.href = currentProfile.phd_degree
        ? `${API_URL}${currentProfile.phd_degree}`
        : "#";
    if (elements.facultyJournalsList)
      elements.facultyJournalsList.href = currentProfile.journals_list
        ? `${API_URL}${currentProfile.journals_list}`
        : "#";
    if (elements.facultyConferencesList)
      elements.facultyConferencesList.href = currentProfile.conferences_list
        ? `${API_URL}${currentProfile.conferences_list}`
        : "#";
    if (elements.facultyAuSupervisorLetter)
      elements.facultyAuSupervisorLetter.href =
        currentProfile.au_supervisor_letter
          ? `${API_URL}${currentProfile.au_supervisor_letter}`
          : "#";
    if (elements.facultyFdpWorkshopsWebinars)
      elements.facultyFdpWorkshopsWebinars.href =
        currentProfile.fdp_workshops_webinars
          ? `${API_URL}${currentProfile.fdp_workshops_webinars}`
          : "#";
    if (elements.facultyNptelCoursera)
      elements.facultyNptelCoursera.href = currentProfile.nptel_coursera
        ? `${API_URL}${currentProfile.nptel_coursera}`
        : "#";
    if (elements.facultyInvitedTalks)
      elements.facultyInvitedTalks.href = currentProfile.invited_talks
        ? `${API_URL}${currentProfile.invited_talks}`
        : "#";
    if (elements.facultyProjectsSanction)
      elements.facultyProjectsSanction.href = currentProfile.projects_sanction
        ? `${API_URL}${currentProfile.projects_sanction}`
        : "#";
    if (elements.facultyConsultancy)
      elements.facultyConsultancy.href = currentProfile.consultancy
        ? `${API_URL}${currentProfile.consultancy}`
        : "#";
    if (elements.facultyPatent)
      elements.facultyPatent.href = currentProfile.patent
        ? `${API_URL}${currentProfile.patent}`
        : "#";
    if (elements.facultyCommunityCert)
      elements.facultyCommunityCert.href = currentProfile.community_cert
        ? `${API_URL}${currentProfile.community_cert}`
        : "#";
    if (elements.facultyAadhar)
      elements.facultyAadhar.href = currentProfile.aadhar
        ? `${API_URL}${currentProfile.aadhar}`
        : "#";
    if (elements.facultyPan)
      elements.facultyPan.href = currentProfile.pan
        ? `${API_URL}${currentProfile.pan}`
        : "#";

    if (
      currentUser &&
      (currentUser.id === currentProfile.user_id.toString() ||
        currentUser.role === "manager")
    ) {
      elements.editBtn.classList.remove("hidden");
    } else {
      elements.editBtn.classList.add("hidden");
    }
  } catch (err) {
    showToast("Failed to load faculty profile: " + err.message, "error");
    console.error("Profile fetch error:", err);
    if (elements.facultyPic)
      elements.facultyPic.src = "https://via.placeholder.com/150";
    if (elements.facultyName)
      elements.facultyName.textContent = "Profile Not Found";
    if (elements.facultyBio) elements.facultyBio.textContent = "N/A";
    if (elements.facultyResearch) elements.facultyResearch.textContent = "N/A";
    if (elements.facultyQual) elements.facultyQual.textContent = "N/A";
    if (elements.facultyExp) elements.facultyExp.textContent = "N/A";
    if (elements.facultyTenthCert) elements.facultyTenthCert.href = "#";
    if (elements.facultyTwelfthCert) elements.facultyTwelfthCert.href = "#";
    if (elements.facultyAppointmentOrder)
      elements.facultyAppointmentOrder.href = "#";
    if (elements.facultyJoiningReport) elements.facultyJoiningReport.href = "#";
    if (elements.facultyUgDegree) elements.facultyUgDegree.href = "#";
    if (elements.facultyPgMsConsolidated)
      elements.facultyPgMsConsolidated.href = "#";
    if (elements.facultyPhdDegree) elements.facultyPhdDegree.href = "#";
    if (elements.facultyJournalsList) elements.facultyJournalsList.href = "#";
    if (elements.facultyConferencesList)
      elements.facultyConferencesList.href = "#";
    if (elements.facultyAuSupervisorLetter)
      elements.facultyAuSupervisorLetter.href = "#";
    if (elements.facultyFdpWorkshopsWebinars)
      elements.facultyFdpWorkshopsWebinars.href = "#";
    if (elements.facultyNptelCoursera) elements.facultyNptelCoursera.href = "#";
    if (elements.facultyInvitedTalks) elements.facultyInvitedTalks.href = "#";
    if (elements.facultyProjectsSanction)
      elements.facultyProjectsSanction.href = "#";
    if (elements.facultyConsultancy) elements.facultyConsultancy.href = "#";
    if (elements.facultyPatent) elements.facultyPatent.href = "#";
    if (elements.facultyCommunityCert) elements.facultyCommunityCert.href = "#";
    if (elements.facultyAadhar) elements.facultyAadhar.href = "#";
    if (elements.facultyPan) elements.facultyPan.href = "#";
  }
}

// Edit Profile
if (elements.editBtn) {
  elements.editBtn.addEventListener("click", () => {
    if (!currentUser) {
      showToast("Please login to edit this profile", "error");
      elements.loginModal.classList.remove("hidden");
      return;
    }
    if (
      currentUser.id !== currentProfile.user_id.toString() &&
      currentUser.role !== "manager"
    ) {
      showToast("Unauthorized: You can only edit your own profile", "error");
      return;
    }
    if (!currentProfile) return showToast("No profile data available", "error");
    elements.editModal.classList.remove("hidden");
    elements.editTitle.innerHTML = `<i class="fas fa-user-edit"></i> Edit Faculty Profile`;
    elements.profileForm.id.value = facultyId;
    elements.profileForm.name.value = currentProfile.name || "";
    elements.profileForm.department.value = currentProfile.department || "IT";
    elements.profileForm.bio.value = currentProfile.bio || "";
    elements.profileForm.qualifications.value =
      currentProfile.qualifications || "";
    elements.profileForm.experience.value = currentProfile.experience || "";
    elements.profileForm.research.value = currentProfile.research || "";
    elements.profileForm.profile_pic.value = "";
    elements.profileForm.tenth_cert.value = "";
    elements.profileForm.twelfth_cert.value = "";
    elements.profileForm.appointment_order.value = "";
    elements.profileForm.joining_report.value = "";
    elements.profileForm.ug_degree.value = "";
    elements.profileForm.pg_ms_consolidated.value = "";
    elements.profileForm.phd_degree.value = "";
    elements.profileForm.journals_list.value = "";
    elements.profileForm.conferences_list.value = "";
    elements.profileForm.au_supervisor_letter.value = "";
    elements.profileForm.fdp_workshops_webinars.value = "";
    elements.profileForm.nptel_coursera.value = "";
    elements.profileForm.invited_talks.value = "";
    elements.profileForm.projects_sanction.value = "";
    elements.profileForm.consultancy.value = "";
    elements.profileForm.patent.value = "";
    elements.profileForm.community_cert.value = "";
    elements.profileForm.aadhar.value = "";
    elements.profileForm.pan.value = "";
  });
}

if (elements.profileForm) {
  elements.profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please login to save changes", "error");
      elements.loginModal.classList.remove("hidden");
      return;
    }
    if (
      currentUser.id !== currentProfile.user_id.toString() &&
      currentUser.role !== "manager"
    ) {
      showToast("Unauthorized: You can only edit your own profile", "error");
      return;
    }
    const formData = new FormData(elements.profileForm);
    console.log("Sending update request:", Array.from(formData.entries()));
    try {
      const res = await fetch(`${API_URL}/profiles/${facultyId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();
      console.log("Update response:", data);
      if (data.success) {
        elements.editModal.classList.add("hidden");
        currentProfile = data.profile;
        loadFacultyProfile();
        showToast(`Faculty profile updated: ${formData.get("name")}`);
      } else {
        showToast(`Failed to update faculty: ${data.message}`, "error");
      }
    } catch (err) {
      showToast("Server error during update: " + err.message, "error");
      console.error(err);
    }
  });
}

if (elements.closeEdit) {
  elements.closeEdit.addEventListener("click", () =>
    elements.editModal.classList.add("hidden")
  );
}

// Export to PDF
if (elements.exportPdf) {
  elements.exportPdf.addEventListener("click", () => {
    if (!currentProfile) {
      showToast("No faculty profile data available for export", "error");
      return;
    }
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("SSN IT Faculty Profile", 105, 20, { align: "center" });

    // Content
    doc.setFontSize(12);
    const content = [
      `Name: ${currentProfile.name || "Unknown"}`,
      `Department: ${currentProfile.department || "IT"}`,
      `Bio: ${currentProfile.bio || "N/A"}`,
      `Qualifications: ${currentProfile.qualifications || "N/A"}`,
      `Experience: ${currentProfile.experience || "N/A"}`,
      `Research Interests: ${currentProfile.research || "N/A"}`,
      `10th Certificate: ${currentProfile.tenth_cert || "N/A"}`,
      `12th Certificate: ${currentProfile.twelfth_cert || "N/A"}`,
      `Appointment Order: ${currentProfile.appointment_order || "N/A"}`,
      `Joining Report: ${currentProfile.joining_report || "N/A"}`,
      `UG Degree Certificate: ${currentProfile.ug_degree || "N/A"}`,
      `Consolidated PG MS: ${currentProfile.pg_ms_consolidated || "N/A"}`,
      `PhD Degree Certificate: ${currentProfile.phd_degree || "N/A"}`,
      `List of Journals: ${currentProfile.journals_list || "N/A"}`,
      `List of Conferences: ${currentProfile.conferences_list || "N/A"}`,
      `AU Supervisor Recognition Letter: ${
        currentProfile.au_supervisor_letter || "N/A"
      }`,
      `FDP/Workshops/Webinars: ${
        currentProfile.fdp_workshops_webinars || "N/A"
      }`,
      `NPTEL/Coursera Courses: ${currentProfile.nptel_coursera || "N/A"}`,
      `Invited Talks: ${currentProfile.invited_talks || "N/A"}`,
      `Projects Sanction Order: ${currentProfile.projects_sanction || "N/A"}`,
      `Consultancy: ${currentProfile.consultancy || "N/A"}`,
      `Patent: ${currentProfile.patent || "N/A"}`,
      `Community Certificate: ${currentProfile.community_cert || "N/A"}`,
      `Aadhar: ${currentProfile.aadhar || "N/A"}`,
      `PAN: ${currentProfile.pan || "N/A"}`,
    ];

    let y = 40;
    content.forEach((line) => {
      const splitText = doc.splitTextToSize(line, 170); // Wrap text to fit 170mm width
      splitText.forEach((text) => {
        doc.text(text, 105, y, { align: "center" });
        y += 10; // Proper spacing
      });
    });

    doc.save(`${currentProfile.name || "faculty"}_SSN_Profile.pdf`);
    showToast(`Exported PDF for ${currentProfile.name || "faculty"}`);
  });
}

// Back Button
if (elements.backBtn) {
  elements.backBtn.addEventListener("click", () => {
    window.location.href = "/index.html";
  });
}

// Initial Load with Token Validation
async function initialize() {
  const token = localStorage.getItem("token");
  if (token) {
    const isValid = await validateToken(token);
    if (isValid) {
      try {
        const res = await fetch(`${API_URL}/profiles/${facultyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        currentProfile = data;
        currentUser = {
          id: data.user_id.toString(),
          email: localStorage.getItem("email") || "Unknown",
          role:
            localStorage.getItem("email") === "admin@ssn.edu.in"
              ? "manager"
              : "staff",
        };
        elements.loginBtn.classList.add("hidden");
        elements.logoutBtn.classList.remove("hidden");
        elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
      } catch (err) {
        console.error("Failed to initialize user:", err);
        currentUser = null;
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        elements.loginBtn.classList.remove("hidden");
        elements.logoutBtn.classList.add("hidden");
        elements.userStatus.innerHTML = "";
      }
    } else {
      currentUser = null;
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      elements.loginBtn.classList.remove("hidden");
      elements.logoutBtn.classList.add("hidden");
      elements.userStatus.innerHTML = "";
    }
  }
  loadFacultyProfile();
}

initialize();
