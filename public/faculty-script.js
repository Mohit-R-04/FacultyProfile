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
        fetchCurrentUser(); // Fetch full user details after login
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

// Fetch Current User Details
async function fetchCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user; // Update with full user data including profileId
      console.log("Current user fetched:", currentUser);
      elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    currentUser = null;
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    elements.loginBtn.classList.remove("hidden");
    elements.logoutBtn.classList.add("hidden");
    elements.userStatus.innerHTML = "";
    showToast("Session invalid. Please log in again.", "error");
  }
}

// Load Faculty Profile with Hiding Logic
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

    // Populate and conditionally hide fields
    if (elements.facultyPic)
      elements.facultyPic.src = currentProfile.profile_pic
        ? `${API_URL}${currentProfile.profile_pic}?t=${Date.now()}`
        : "https://via.placeholder.com/150";
    if (elements.facultyName)
      elements.facultyName.textContent = currentProfile.name || "Unknown";

    // Text fields
    setTextField("faculty-bio", "bio-item", currentProfile.bio);
    setTextField("faculty-research", "research-item", currentProfile.research);
    setTextField(
      "faculty-qual",
      "qualifications-item",
      currentProfile.qualifications
    );
    setTextField("faculty-exp", "experience-item", currentProfile.experience);

    // Link fields
    setLinkField(
      "faculty-tenth-cert",
      "tenth-cert-item",
      currentProfile.tenth_cert
    );
    setLinkField(
      "faculty-twelfth-cert",
      "twelfth-cert-item",
      currentProfile.twelfth_cert
    );
    setLinkField(
      "faculty-appointment-order",
      "appointment-order-item",
      currentProfile.appointment_order
    );
    setLinkField(
      "faculty-joining-report",
      "joining-report-item",
      currentProfile.joining_report
    );
    setLinkField(
      "faculty-ug-degree",
      "ug-degree-item",
      currentProfile.ug_degree
    );
    setLinkField(
      "faculty-pg-ms-consolidated",
      "pg-ms-consolidated-item",
      currentProfile.pg_ms_consolidated
    );
    setLinkField(
      "faculty-phd-degree",
      "phd-degree-item",
      currentProfile.phd_degree
    );
    setLinkField(
      "faculty-journals-list",
      "journals-list-item",
      currentProfile.journals_list
    );
    setLinkField(
      "faculty-conferences-list",
      "conferences-list-item",
      currentProfile.conferences_list
    );
    setLinkField(
      "faculty-au-supervisor-letter",
      "au-supervisor-letter-item",
      currentProfile.au_supervisor_letter
    );
    setLinkField(
      "faculty-fdp-workshops-webinars",
      "fdp-workshops-webinars-item",
      currentProfile.fdp_workshops_webinars
    );
    setLinkField(
      "faculty-nptel-coursera",
      "nptel-coursera-item",
      currentProfile.nptel_coursera
    );
    setLinkField(
      "faculty-invited-talks",
      "invited-talks-item",
      currentProfile.invited_talks
    );
    setLinkField(
      "faculty-projects-sanction",
      "projects-sanction-item",
      currentProfile.projects_sanction
    );
    setLinkField(
      "faculty-consultancy",
      "consultancy-item",
      currentProfile.consultancy
    );
    setLinkField("faculty-patent", "patent-item", currentProfile.patent);
    setLinkField(
      "faculty-community-cert",
      "community-cert-item",
      currentProfile.community_cert
    );
    setLinkField("faculty-aadhar", "aadhar-item", currentProfile.aadhar);
    setLinkField("faculty-pan", "pan-item", currentProfile.pan);

    // Show edit button only if current user owns the profile or is a manager
    if (
      currentUser &&
      (currentUser.profileId == facultyId || currentUser.role === "manager")
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
    hideAllFieldsOnError();
  }
}

// Helper Functions for Hiding Fields
function setTextField(elementId, itemId, value) {
  const element = document.getElementById(elementId);
  const item = document.getElementById(itemId);
  if (element && item) {
    if (value && value.trim() !== "") {
      element.textContent = value;
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
}

function setLinkField(elementId, itemId, value) {
  const element = document.getElementById(elementId);
  const item = document.getElementById(itemId);
  if (element && item) {
    if (value && value.trim() !== "") {
      element.href = `${API_URL}${value}`;
      element.textContent = "Download";
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
}

function hideAllFieldsOnError() {
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
    if (!currentUser) {
      showToast("Please login to edit this profile", "error");
      elements.loginModal.classList.remove("hidden");
      return;
    }
    if (currentUser.profileId != facultyId && currentUser.role !== "manager") {
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
    if (currentUser.profileId != facultyId && currentUser.role !== "manager") {
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

    // Content (only include fields that exist)
    doc.setFontSize(12);
    const content = [];
    if (currentProfile.name) content.push(`Name: ${currentProfile.name}`);
    if (currentProfile.department)
      content.push(`Department: ${currentProfile.department}`);
    if (currentProfile.bio) content.push(`Bio: ${currentProfile.bio}`);
    if (currentProfile.qualifications)
      content.push(`Qualifications: ${currentProfile.qualifications}`);
    if (currentProfile.experience)
      content.push(`Experience: ${currentProfile.experience}`);
    if (currentProfile.research)
      content.push(`Research Interests: ${currentProfile.research}`);
    if (currentProfile.tenth_cert)
      content.push(`10th Certificate: ${currentProfile.tenth_cert}`);
    if (currentProfile.twelfth_cert)
      content.push(`12th Certificate: ${currentProfile.twelfth_cert}`);
    if (currentProfile.appointment_order)
      content.push(`Appointment Order: ${currentProfile.appointment_order}`);
    if (currentProfile.joining_report)
      content.push(`Joining Report: ${currentProfile.joining_report}`);
    if (currentProfile.ug_degree)
      content.push(`UG Degree Certificate: ${currentProfile.ug_degree}`);
    if (currentProfile.pg_ms_consolidated)
      content.push(`Consolidated PG MS: ${currentProfile.pg_ms_consolidated}`);
    if (currentProfile.phd_degree)
      content.push(`PhD Degree Certificate: ${currentProfile.phd_degree}`);
    if (currentProfile.journals_list)
      content.push(`List of Journals: ${currentProfile.journals_list}`);
    if (currentProfile.conferences_list)
      content.push(`List of Conferences: ${currentProfile.conferences_list}`);
    if (currentProfile.au_supervisor_letter)
      content.push(
        `AU Supervisor Recognition Letter: ${currentProfile.au_supervisor_letter}`
      );
    if (currentProfile.fdp_workshops_webinars)
      content.push(
        `FDP/Workshops/Webinars: ${currentProfile.fdp_workshops_webinars}`
      );
    if (currentProfile.nptel_coursera)
      content.push(`NPTEL/Coursera Courses: ${currentProfile.nptel_coursera}`);
    if (currentProfile.invited_talks)
      content.push(`Invited Talks: ${currentProfile.invited_talks}`);
    if (currentProfile.projects_sanction)
      content.push(
        `Projects Sanction Order: ${currentProfile.projects_sanction}`
      );
    if (currentProfile.consultancy)
      content.push(`Consultancy: ${currentProfile.consultancy}`);
    if (currentProfile.patent) content.push(`Patent: ${currentProfile.patent}`);
    if (currentProfile.community_cert)
      content.push(`Community Certificate: ${currentProfile.community_cert}`);
    if (currentProfile.aadhar) content.push(`Aadhar: ${currentProfile.aadhar}`);
    if (currentProfile.pan) content.push(`PAN: ${currentProfile.pan}`);

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
    window.location.href = "/index.html";
  });
}

// Initial Load with Token Validation
async function initialize() {
  const token = localStorage.getItem("token");
  if (token) {
    await fetchCurrentUser(); // Fetch full user details
  }
  loadFacultyProfile();
}

initialize();
