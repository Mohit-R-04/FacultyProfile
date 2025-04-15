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
let facultyId = new URLSearchParams(window.location.search).get("id");
let currentProfile = null;

// Utility Functions
function showToast(message, type = "success") {
  console.log(`[TOAST] ${type}: ${message}`);
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${
    type === "success" ? "check-circle" : "exclamation-circle"
  }"></i> ${message}`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Validate Token and Fetch User Info
async function validateToken(token) {
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!data.success || !data.user) return null;
    return {
      id: String(data.user.id),
      email: data.user.email,
      role: data.user.role,
    };
  } catch (err) {
    console.error("Token validation error:", err);
    return null;
  }
}

// Initialize App State
async function initApp() {
  const token = localStorage.getItem("token");
  if (token) {
    currentUser = await validateToken(token);
    if (currentUser) {
      updateUI();
      if (facultyId) {
        await loadFacultyProfile();
      }
    } else {
      localStorage.removeItem("token");
    }
  }
  if (facultyId) {
    await loadFacultyProfile();
  }
}

// Call initApp when the page loads
document.addEventListener("DOMContentLoaded", initApp);

// Update UI Based on User State
function updateUI() {
  console.log("[updateUI] Current user:", currentUser);
  if (currentUser && currentUser.id && currentUser.email && currentUser.role) {
    elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
    elements.loginBtn.classList.add("hidden");
    elements.logoutBtn.classList.remove("hidden");
  } else {
    console.log("[updateUI] Invalid or no user, resetting UI");
    elements.userStatus.innerHTML = "";
    elements.loginBtn.classList.remove("hidden");
    elements.logoutBtn.classList.add("hidden");
    elements.editBtn.classList.add("hidden");
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

// Event Listeners
if (elements.loginBtn) {
  elements.loginBtn.addEventListener("click", () => {
    console.log("[loginBtn] Opening modal");
    elements.loginModal.classList.remove("hidden");
  });
}
if (elements.closeLogin) {
  elements.closeLogin.addEventListener("click", () => {
    console.log("[closeLogin] Closing modal");
    elements.loginModal.classList.add("hidden");
  });
}

// Login
if (elements.loginForm) {
  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.loginForm.email.value;
    const password = elements.loginForm.password.value;
    console.log("[login] Attempting:", email);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("[login] Response:", JSON.stringify(data, null, 2));
      if (
        data.success &&
        data.token &&
        data.user &&
        data.user.id &&
        data.user.email &&
        data.user.role
      ) {
        currentUser = {
          id: String(data.user.id),
          email: data.user.email,
          role: data.user.role,
        };
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.user.email);
        console.log("[login] Token set:", data.token.substring(0, 10) + "...");
        console.log("[login] User set:", currentUser);
        elements.loginModal.classList.add("hidden");
        updateUI();
        await loadFacultyProfile();
        showToast(`Welcome, ${currentUser.email}!`);
      } else {
        showToast(
          "Login failed: " + (data.message || "Invalid response"),
          "error"
        );
      }
    } catch (err) {
      showToast("Login error: " + err.message, "error");
      console.error("[login] Error:", err);
    }
  });
}

// Logout
if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", () => {
    console.log("[logout] Clearing user session");
    currentUser = null;
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    updateUI();
    loadFacultyProfile();
    showToast("Logged out successfully");
  });
}

// Load Faculty Profile
async function loadFacultyProfile() {
  console.log("[loadFacultyProfile] Faculty ID:", facultyId);
  if (!facultyId || facultyId === "undefined") {
    console.log("[loadFacultyProfile] No valid ID");
    if (elements.facultyName)
      elements.facultyName.textContent = "No Profile Selected";
    return;
  }
  try {
    const token = localStorage.getItem("token");
    console.log(
      "[loadFacultyProfile] Token:",
      token ? token.substring(0, 10) + "..." : "None"
    );
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/profiles/${facultyId}`, {
      headers,
      cache: "no-store",
    });
    console.log("[loadFacultyProfile] Status:", res.status);
    if (!res.ok) throw new Error("Profile fetch failed: " + res.status);
    currentProfile = await res.json();
    console.log(
      "[loadFacultyProfile] Profile:",
      JSON.stringify(currentProfile, null, 2)
    );

    if (elements.facultyPic)
      elements.facultyPic.src = currentProfile.profile_pic
        ? `${API_URL}${currentProfile.profile_pic}?t=${Date.now()}`
        : "https://via.placeholder.com/150";
    if (elements.facultyName)
      elements.facultyName.textContent = currentProfile.name || "Unknown";

    setField("faculty-bio", "bio-item", currentProfile.bio);
    setField("faculty-research", "research-item", currentProfile.research);
    setField(
      "faculty-qual",
      "qualifications-item",
      currentProfile.qualifications
    );
    setField("faculty-exp", "experience-item", currentProfile.experience);

    setLink("faculty-tenth-cert", "tenth-cert-item", currentProfile.tenth_cert);
    setLink(
      "faculty-twelfth-cert",
      "twelfth-cert-item",
      currentProfile.twelfth_cert
    );
    setLink(
      "faculty-appointment-order",
      "appointment-order-item",
      currentProfile.appointment_order
    );
    setLink(
      "faculty-joining-report",
      "joining-report-item",
      currentProfile.joining_report
    );
    setLink("faculty-ug-degree", "ug-degree-item", currentProfile.ug_degree);
    setLink(
      "faculty-pg-ms-consolidated",
      "pg-ms-consolidated-item",
      currentProfile.pg_ms_consolidated
    );
    setLink("faculty-phd-degree", "phd-degree-item", currentProfile.phd_degree);
    setLink(
      "faculty-journals-list",
      "journals-list-item",
      currentProfile.journals_list
    );
    setLink(
      "faculty-conferences-list",
      "conferences-list-item",
      currentProfile.conferences_list
    );
    setLink(
      "faculty-au-supervisor-letter",
      "au-supervisor-letter-item",
      currentProfile.au_supervisor_letter
    );
    setLink(
      "faculty-fdp-workshops-webinars",
      "fdp-workshops-webinars-item",
      currentProfile.fdp_workshops_webinars
    );
    setLink(
      "faculty-nptel-coursera",
      "nptel-coursera-item",
      currentProfile.nptel_coursera
    );
    setLink(
      "faculty-invited-talks",
      "invited-talks-item",
      currentProfile.invited_talks
    );
    setLink(
      "faculty-projects-sanction",
      "projects-sanction-item",
      currentProfile.projects_sanction
    );
    setLink(
      "faculty-consultancy",
      "consultancy-item",
      currentProfile.consultancy
    );
    setLink("faculty-patent", "patent-item", currentProfile.patent);
    setLink(
      "faculty-community-cert",
      "community-cert-item",
      currentProfile.community_cert
    );
    setLink("faculty-aadhar", "aadhar-item", currentProfile.aadhar);
    setLink("faculty-pan", "pan-item", currentProfile.pan);

    if (
      currentUser &&
      (currentUser.id === String(currentProfile.user_id) ||
        currentUser.role === "manager")
    ) {
      console.log(
        "[loadFacultyProfile] Showing edit button for:",
        currentUser.id
      );
      elements.editBtn.classList.remove("hidden");
    } else {
      elements.editBtn.classList.add("hidden");
    }
  } catch (err) {
    showToast("Failed to load profile: " + err.message, "error");
    console.error("[loadFacultyProfile] Error:", err);
    if (elements.facultyName)
      elements.facultyName.textContent = "Profile Load Error";
    hideAllFields();
  }
}

// Field Helpers
function setField(elementId, itemId, value) {
  const element = document.getElementById(elementId);
  const item = document.getElementById(itemId);
  if (element && item) {
    if (value && value.trim()) {
      element.textContent = value;
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
}

function setLink(elementId, itemId, value) {
  const element = document.getElementById(elementId);
  const item = document.getElementById(itemId);
  if (element && item) {
    if (value && value.trim()) {
      element.href = `${API_URL}${value}`;
      element.textContent = "Download";
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
}

function hideAllFields() {
  const fields = [
    "bio-item",
    "research-item",
    "qualifications-item",
    "experience-item",
    "tenth-cert-item",
    "twelfth-cert-item",
    "appointment-order-item",
    "joining-report-item",
    "ug-degree-item",
    "pg-ms-consolidated-item",
    "phd-degree-item",
    "journals-list-item",
    "conferences-list-item",
    "au-supervisor-letter-item",
    "fdp-workshops-webinars-item",
    "nptel-coursera-item",
    "invited-talks-item",
    "projects-sanction-item",
    "consultancy-item",
    "patent-item",
    "community-cert-item",
    "aadhar-item",
    "pan-item",
  ];
  fields.forEach((id) => {
    const item = document.getElementById(id);
    if (item) item.classList.add("hidden");
  });
}

// Edit Profile
if (elements.editBtn) {
  elements.editBtn.addEventListener("click", () => {
    console.log("[editBtn] Clicked, user:", currentUser);
    if (!currentUser) {
      showToast("Please log in to edit", "error");
      elements.loginModal.classList.remove("hidden");
      return;
    }
    if (
      currentUser.id !== String(currentProfile.user_id) &&
      currentUser.role !== "manager"
    ) {
      showToast("Unauthorized to edit this profile", "error");
      return;
    }
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
    console.log("[profileForm] Submitting, user:", currentUser);
    if (!currentUser) {
      showToast("Please log in to save", "error");
      elements.loginModal.classList.remove("hidden");
      return;
    }
    if (
      currentUser.id !== String(currentProfile.user_id) &&
      currentUser.role !== "manager"
    ) {
      showToast("Unauthorized to edit this profile", "error");
      return;
    }
    const formData = new FormData(elements.profileForm);
    try {
      const res = await fetch(`${API_URL}/profiles/${facultyId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();
      console.log("[profileForm] Response:", JSON.stringify(data, null, 2));
      if (data.success) {
        elements.editModal.classList.add("hidden");
        currentProfile = data.profile;
        await loadFacultyProfile();
        showToast(`Profile updated: ${formData.get("name")}`);
      } else {
        showToast(
          "Update failed: " + (data.message || "Unknown error"),
          "error"
        );
      }
    } catch (err) {
      showToast("Update error: " + err.message, "error");
      console.error("[profileForm] Error:", err);
    }
  });
}

if (elements.closeEdit) {
  elements.closeEdit.addEventListener("click", () => {
    console.log("[closeEdit] Closing modal");
    elements.editModal.classList.add("hidden");
  });
}

// Export to PDF
if (elements.exportPdf) {
  elements.exportPdf.addEventListener("click", () => {
    console.log("[exportPdf] Exporting profile:", currentProfile);
    if (!currentProfile) {
      showToast("No profile data to export", "error");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SSN IT Faculty Profile", 105, 20, { align: "center" });
    doc.setFontSize(12);
    const content = [
      `Name: ${currentProfile.name || ""}`,
      `Department: ${currentProfile.department || ""}`,
      `Bio: ${currentProfile.bio || ""}`,
      `Qualifications: ${currentProfile.qualifications || ""}`,
      `Experience: ${currentProfile.experience || ""}`,
      `Research Interests: ${currentProfile.research || ""}`,
      `10th Certificate: ${currentProfile.tenth_cert || ""}`,
      `12th Certificate: ${currentProfile.twelfth_cert || ""}`,
      `Appointment Order: ${currentProfile.appointment_order || ""}`,
      `Joining Report: ${currentProfile.joining_report || ""}`,
      `UG Degree: ${currentProfile.ug_degree || ""}`,
      `PG MS: ${currentProfile.pg_ms_consolidated || ""}`,
      `PhD Degree: ${currentProfile.phd_degree || ""}`,
      `Journals: ${currentProfile.journals_list || ""}`,
      `Conferences: ${currentProfile.conferences_list || ""}`,
      `AU Supervisor Letter: ${currentProfile.au_supervisor_letter || ""}`,
      `FDP/Workshops: ${currentProfile.fdp_workshops_webinars || ""}`,
      `NPTEL/Coursera: ${currentProfile.nptel_coursera || ""}`,
      `Invited Talks: ${currentProfile.invited_talks || ""}`,
      `Projects Sanction: ${currentProfile.projects_sanction || ""}`,
      `Consultancy: ${currentProfile.consultancy || ""}`,
      `Patent: ${currentProfile.patent || ""}`,
      `Community Cert: ${currentProfile.community_cert || ""}`,
      `Aadhar: ${currentProfile.aadhar || ""}`,
      `PAN: ${currentProfile.pan || ""}`,
    ].filter((line) => !line.endsWith(": "));

    let y = 40;
    content.forEach((line) => {
      const splitText = doc.splitTextToSize(line, 170);
      splitText.forEach((text) => {
        doc.text(text, 105, y, { align: "center" });
        y += 10;
      });
    });

    doc.save(`${currentProfile.name || "faculty"}_SSN_Profile.pdf`);
    showToast(`Exported PDF for ${currentProfile.name || "faculty"}`);
  });
}

// Back Button
if (elements.backBtn) {
  elements.backBtn.addEventListener("click", () => {
    console.log("[backBtn] Navigating to /index.html, user:", currentUser);
    window.location.href = "/index.html";
  });
}

// Initialize
async function initialize() {
  console.log("[initialize] Starting on:", window.location.pathname);
  const token = localStorage.getItem("token");
  const savedEmail = localStorage.getItem("email");

  console.log(
    "[initialize] Token:",
    token ? token.substring(0, 10) + "..." : "No token"
  );
  console.log("[initialize] Saved email:", savedEmail);

  currentUser = null;

  if (token && savedEmail) {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.user && data.user.email === savedEmail) {
        currentUser = {
          id: String(data.user.id),
          email: data.user.email,
          role: data.user.role,
        };
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
      }
    } catch (err) {
      console.error("[initialize] Error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    }
  }

  updateUI();
  console.log("[initialize] Final state:", currentUser);
  await loadFacultyProfile();
  console.log("[initialize] Done");
}

async function fetchCurrentUser(token) {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

initialize();
