const API_URL =
  window.location.hostname === "localhost" ? "http://localhost:3001" : "";
console.log("App running on:", API_URL);
const { jsPDF } = window.jspdf;

// DOM Elements
const elements = {
  themeToggle: document.getElementById("theme-toggle"),
  loginBtn: document.getElementById("login-btn"),
  viewRequestsBtn: document.getElementById("view-requests-btn"),
  requestsModal: document.getElementById("requests-modal"),
  closeRequests: document.getElementById("close-requests"),
  requestsList: document.getElementById("requests-list"),
  logoutBtn: document.getElementById("logout-btn"),
  researchFilter: document.getElementById("research-filter"),
  userStatus: document.getElementById("user-status"),
  loginModal: document.getElementById("login-modal"),
  loginForm: document.getElementById("login-form"),
  closeLogin: document.getElementById("close-login"),
  profileGrid: document.getElementById("profile-grid"),
  adminDashboard: document.getElementById("admin-dashboard"),
  addStaffBtn: document.getElementById("add-staff-btn"),
  adminProfiles: document.getElementById("admin-profiles"),
  editModal: document.getElementById("edit-modal"),
  editTitle: document.getElementById("edit-title"),
  profileForm: document.getElementById("profile-form"),
  exportPdf: document.getElementById("export-pdf"),
  closeEdit: document.getElementById("close-edit"),
  searchBar: document.getElementById("search-bar"),
  roleFilter: document.getElementById("role-filter"),
  experienceFilter: document.getElementById("experience-filter"),
  resetFilters: document.getElementById("reset-filters"),
  toastContainer: document.getElementById("toast-container"),
  totalStaff: document.getElementById("total-staff"),
  forgotPasswordBtn: document.getElementById("forgot-password-btn"),
  forgotPasswordModal: document.getElementById("forgot-password-modal"),
  forgotPasswordForm: document.getElementById("forgot-password-form"),
  closeForgotPassword: document.getElementById("close-forgot-password"),
};

// State Variables
let currentUser = null;
let profiles = [];
let toastTimeouts = [];

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
  try {
    const res = await fetch(`${API_URL}/profiles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Token validation failed");
    return true;
  } catch (err) {
    console.error("Token validation error:", err);
    return false;
  }
}

// Fetch Current User Info
async function fetchCurrentUser(token) {
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user info");
    return await res.json();
  } catch (err) {
    console.error("Fetch user error:", err);
    return null;
  }
}

// Check and Refresh Token
async function checkToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    logout();
    return false;
  }
  try {
    const userData = await fetchCurrentUser(token);
    if (!userData || !userData.success || !userData.user) {
      showToast("Session expired. Please log in again.", "error");
      logout();
      return false;
    }
    currentUser = userData.user;
    currentUser.id = String(userData.user.id);
    elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
    elements.loginBtn.classList.add("hidden");
    elements.logoutBtn.classList.remove("hidden");
    return true;
  } catch (err) {
    console.error("Token validation error:", err);
    logout();
    return false;
  }
}

// Initialize App
async function initApp() {
  const token = localStorage.getItem("token");
  if (token) {
    const userData = await fetchCurrentUser(token);
    if (userData && userData.success && userData.user) {
      currentUser = userData.user;
      currentUser.id = String(userData.user.id);
      elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
      elements.loginBtn.classList.add("hidden");
      elements.logoutBtn.classList.remove("hidden");
      if (currentUser.role === "manager") {
        elements.adminDashboard.classList.remove("hidden");
        elements.profileGrid.classList.add("hidden");
        loadAdminProfiles();
      } else {
        loadProfiles();
      }
    } else {
      logout();
    }
  }
  loadProfiles();
}

// Call initApp when the page loads
document.addEventListener("DOMContentLoaded", initApp);

// Logout Function
function logout() {
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  elements.loginBtn.classList.remove("hidden");
  elements.logoutBtn.classList.add("hidden");
  elements.userStatus.innerHTML = "";
  elements.adminDashboard.classList.add("hidden");
  elements.profileGrid.classList.remove("hidden");
  loadProfiles();
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
if (elements.loginBtn) {
  elements.loginBtn.addEventListener("click", () =>
    elements.loginModal.classList.remove("hidden")
  );
}

if (elements.closeLogin) {
  elements.closeLogin.addEventListener("click", () =>
    elements.loginModal.classList.add("hidden")
  );
}

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", () => {
    logout();
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
        currentUser.id = String(data.user.id); // Ensure ID consistency
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.user.email);
        elements.loginModal.classList.add("hidden");
        elements.loginBtn.classList.add("hidden");
        elements.logoutBtn.classList.remove("hidden");
        elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
        console.log("Logged in user:", currentUser);
        if (currentUser.role === "manager") {
          elements.adminDashboard.classList.remove("hidden");
          elements.profileGrid.classList.add("hidden");
          loadAdminProfiles();
        } else {
          loadProfiles();
        }
        showToast(`Welcome, ${currentUser.email}!`);
        elements.loginForm.email.value = "";
        elements.loginForm.password.value = "";
      } else {
        showToast("Login failed: " + data.message, "error");
      }
    } catch (err) {
      showToast("Server error during login: " + err.message, "error");
      console.error(err);
    }
  });
}

// Forgot Password (unchanged)
if (elements.forgotPasswordBtn) {
  elements.forgotPasswordBtn.addEventListener("click", () => {
    elements.loginModal.classList.add("hidden");
    elements.forgotPasswordModal.classList.remove("hidden");
  });
}

if (elements.closeForgotPassword) {
  elements.closeForgotPassword.addEventListener("click", () =>
    elements.forgotPasswordModal.classList.add("hidden")
  );
}

if (elements.forgotPasswordForm) {
  elements.forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone_number = elements.forgotPasswordForm.phone_number.value;
    const new_password = elements.forgotPasswordForm.new_password.value;
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number, new_password }),
      });
      const data = await res.json();
      if (data.success) {
        elements.forgotPasswordModal.classList.add("hidden");
        showToast("Password reset successfully");
      } else {
        showToast("Reset failed: " + data.message, "error");
      }
    } catch (err) {
      showToast("Server error during reset: " + err.message, "error");
      console.error(err);
    }
  });
}

// Role Classification Function
function classifyRole(bio) {
  const lowerBio = (bio || "").toLowerCase();
  if (lowerBio.includes("associate professor")) {
    return "Associate Professor";
  } else if (lowerBio.includes("assistant professor")) {
    return "Assistant Professor";
  } else if (
    lowerBio.includes("professor") &&
    !lowerBio.includes("associate") &&
    !lowerBio.includes("assistant")
  ) {
    return "Professor";
  }
  return "Assistant Professor"; // Default to Assistant Professor if no match
}

// Helper function to get role priority for sorting
function getRolePriority(role) {
  switch (role) {
    case "Professor":
      return 1;
    case "Associate Professor":
      return 2;
    case "Assistant Professor":
      return 3;
    default:
      return 4;
  }
}

// Load Profiles (Public Access)
async function loadProfiles() {
  try {
    const res = await fetch(`${API_URL}/profiles`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch profiles");
    profiles = await res.json();
    profiles.forEach((profile) => {
      profile.role = classifyRole(profile.bio);
    });
    console.log("Fetched profiles:", profiles);
    renderProfiles(profiles);
  } catch (err) {
    showToast("Failed to load profiles: " + err.message, "error");
    console.error(err);
  }
}

function renderProfiles(profileList) {
  elements.profileGrid.innerHTML = "";
  if (!profileList.length) {
    elements.profileGrid.innerHTML =
      '<div class="grid-placeholder">No IT faculty profiles found</div>';
    return;
  }
  
  // Sort profiles by role
  const sortedProfiles = [...profileList].sort((a, b) => {
    return getRolePriority(a.role) - getRolePriority(b.role);
  });

  sortedProfiles.forEach((profile) => {
    const card = document.createElement("div");
    card.className = "profile-card glassy";
    const isOwnProfile =
      currentUser &&
      currentUser.role === "staff" &&
      String(profile.user_id) === currentUser.id;

    let editButton = "";
    if (isOwnProfile) {
      if (profile.is_locked) {
        editButton = `<button class="btn glassy-btn btn-warning" onclick="requestEdit(${profile.id})">Request Edit</button>`;
      } else {
        editButton = `<button class="btn glassy-btn btn-secondary" onclick="editProfile(${profile.id})">Edit</button>`;
      }
    }

    card.innerHTML = `
      <img src="${
        profile.profile_pic
          ? `${API_URL}${profile.profile_pic}?t=${Date.now()}`
          : "https://via.placeholder.com/150"
      }" alt="${profile.name}" class="profile-avatar">
      <h3>${profile.name || "Unknown"}</h3>
      <p><strong>Qualifications:</strong> ${profile.qualifications || "N/A"}</p>
      <p>${
        profile.bio ? profile.bio.substring(0, 50) + "..." : "No bio available"
      }</p>
      <p><strong>Role:</strong> ${profile.role}</p>
      <div class="profile-actions">
        <button class="btn glassy-btn btn-primary" onclick="window.location.href='faculty-profile.html?id=${
          profile.id
        }'">View Profile</button>
        ${editButton}
      </div>
    `;
    elements.profileGrid.appendChild(card);
  });
}

// Load Admin Profiles (Authenticated Access)
async function loadAdminProfiles() {
  if (!(await checkToken())) return;
  try {
    const res = await fetch(`${API_URL}/profiles`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch profiles");
    profiles = await res.json();
    profiles.forEach((profile) => {
      profile.role = classifyRole(profile.bio);
    });
    console.log("Fetched admin profiles:", profiles);
    elements.totalStaff.textContent = profiles.length;

    // Add Lock All button if not exists
    let lockAllBtn = document.getElementById("lock-all-btn");
    if (!lockAllBtn) {
      lockAllBtn = document.createElement("button");
      lockAllBtn.id = "lock-all-btn";
      lockAllBtn.className = "btn glassy-btn btn-warning";
      elements.totalStaff.parentNode.appendChild(lockAllBtn);
    }

    // Check if any profiles are unlocked
    const hasUnlockedProfiles = profiles.some((p) => !p.is_locked);
    lockAllBtn.textContent = hasUnlockedProfiles
      ? "Lock All Profiles"
      : "Unlock All Profiles";
    lockAllBtn.onclick = () => toggleAllProfiles(hasUnlockedProfiles);

    renderAdminProfiles(profiles);
  } catch (err) {
    showToast("Failed to load admin profiles: " + err.message, "error");
    console.error(err);
  }
}

async function toggleAllProfiles(lock) {
  try {
    const res = await fetch(`${API_URL}/profiles/lock-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ lock }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`All profiles ${lock ? "locked" : "unlocked"} successfully`);
      loadAdminProfiles();
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function toggleLock(id, lock) {
  try {
    const res = await fetch(`${API_URL}/profiles/${id}/lock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ lock }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Profile ${lock ? "locked" : "unlocked"} successfully`);
      loadAdminProfiles();
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function requestEdit(id) {
  try {
    const res = await fetch(`${API_URL}/profiles/${id}/request-edit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      showToast("Edit request submitted successfully");
      loadProfiles();
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function approveEdit(id) {
  try {
    const res = await fetch(`${API_URL}/profiles/${id}/approve-edit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      showToast("Edit request approved");
      loadAdminProfiles();
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderAdminProfiles(profileList) {
  elements.adminProfiles.innerHTML = "";
  
  // Sort profiles by role
  const sortedProfiles = [...profileList].sort((a, b) => {
    return getRolePriority(a.role) - getRolePriority(b.role);
  });

  sortedProfiles.forEach((profile) => {
    const card = document.createElement("div");
    card.className = "profile-card glassy";
    const canEdit =
      currentUser.role === "manager" ||
      (currentUser.role === "staff" &&
        String(profile.user_id) === currentUser.id);
    card.innerHTML = `
      <img src="${
        profile.profile_pic
          ? `${API_URL}${profile.profile_pic}?t=${Date.now()}`
          : "https://via.placeholder.com/150"
      }" alt="${profile.name}" class="profile-avatar">
      <h3>${profile.name || "Unknown"}</h3>
      <p><strong>Qualifications:</strong> ${profile.qualifications || "N/A"}</p>
      <p>${
        profile.bio ? profile.bio.substring(0, 50) + "..." : "No bio available"
      }</p>
      <p><strong>Role:</strong> ${profile.role}</p>
      <div class="profile-actions">
        <button class="btn glassy-btn btn-primary" onclick="viewProfile(${
          profile.id
        })">View</button>
        ${
          canEdit
            ? profile.is_locked && currentUser.role !== "manager"
              ? `<button class="btn glassy-btn btn-warning" onclick="requestEdit(${profile.id})">Request Edit</button>`
              : `<button class="btn glassy-btn btn-secondary" onclick="editProfile(${profile.id})">Edit</button>`
            : ""
        }
        ${
          currentUser.role === "manager"
            ? `
            ${
              profile.edit_requested
                ? `<button class="btn glassy-btn btn-primary" onclick="approveEdit(${profile.id})">Approve Edit</button>`
                : ""
            }
            <button class="btn glassy-btn ${
              profile.is_locked ? "btn-success" : "btn-warning"
            }" 
              onclick="toggleLock(${profile.id}, ${!profile.is_locked})">
              ${profile.is_locked ? "Unlock" : "Lock"}
            </button>
            <button class="btn glassy-btn btn-danger" onclick="deleteProfile(${
              profile.id
            })">Delete</button>
          `
            : ""
        }
      </div>
    `;
    elements.adminProfiles.appendChild(card);
  });
}

// View Profile
function viewProfile(id) {
  window.location.href = `faculty-profile.html?id=${id}`;
}

// Edit Profile
async function editProfile(id) {
  if (!(await checkToken())) return;
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return showToast("Profile not found", "error");
  if (
    currentUser.role !== "manager" &&
    String(profile.user_id) !== currentUser.id
  ) {
    showToast("Unauthorized: You can only edit your own profile", "error");
    return;
  }

  try {
    // Fetch user data
    const userRes = await fetch(`${API_URL}/users/${profile.user_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const userData = await userRes.json();
    
    if (!userData.success) {
      showToast("Failed to fetch user data", "error");
      return;
    }

    console.log("Editing profile:", profile, "user data:", userData, "by user:", currentUser);
    elements.editModal.classList.remove("hidden");
    elements.editTitle.innerHTML = `<i class="fas fa-user-edit"></i> Edit Faculty Profile`;
    
    // Set form values
    elements.profileForm.id.value = id;
    elements.profileForm.name.value = profile.name || "";
    elements.profileForm.bio.value = profile.bio || "";
    elements.profileForm.qualifications.value = profile.qualifications || "";
    
    // Handle date of joining
    if (profile.date_of_joining) {
      try {
        const date = new Date(profile.date_of_joining);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          elements.profileForm.date_of_joining.value = `${year}-${month}-${day}`;
        } else {
          elements.profileForm.date_of_joining.value = "";
        }
      } catch (err) {
        console.error("Error formatting date:", err);
        elements.profileForm.date_of_joining.value = "";
      }
    } else {
      elements.profileForm.date_of_joining.value = "";
    }
    
    elements.profileForm.research.value = profile.research || "";
    
    // Set user data
    elements.profileForm.email.value = userData.user.email || "";
    elements.profileForm.phone_number.value = userData.user.phone_number || "";
    
    // Show phone number field but hide email field for existing profiles
    elements.profileForm.querySelector("#email-group").classList.add("hidden");
    elements.profileForm.querySelector("#phone-group").classList.remove("hidden");
    
    // Show existing profile picture if it exists
    if (profile.profile_pic) {
      const profilePicPreview = document.getElementById("profile-pic-preview");
      if (profilePicPreview) {
        profilePicPreview.src = `${API_URL}${profile.profile_pic}`;
        profilePicPreview.style.display = "block";
      }
    }
    
    // Reset file inputs
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
  } catch (err) {
    console.error("Error loading profile data:", err);
    showToast("Failed to load profile data", "error");
  }
}

// Delete Profile (Manager Only)
async function deleteProfile(id) {
  if (!(await checkToken())) return;
  if (currentUser.role !== "manager") {
    showToast("Unauthorized: Only managers can delete profiles", "error");
    return;
  }
  if (!confirm("Are you sure you want to delete this profile?")) return;
  try {
    const res = await fetch(`${API_URL}/profiles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (data.success) {
      showToast("Profile deleted successfully");
      profiles = profiles.filter((p) => p.id !== id);
      loadAdminProfiles();
    } else {
      showToast("Failed to delete profile: " + data.message, "error");
    }
  } catch (err) {
    showToast("Server error during delete: " + err.message, "error");
    console.error(err);
  }
}

// Add/Edit Profile Form Submission
if (elements.profileForm) {
  elements.profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileId = formData.get("id");

    try {
      const token = localStorage.getItem("token");
      const method = profileId ? "PUT" : "POST";
      const url = profileId ? `${API_URL}/profiles/${profileId}` : `${API_URL}/profiles`;
      
      // Remove email from formData if editing existing profile
      if (profileId) {
        formData.delete("email");
      }
      
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        showToast(profileId ? "Profile updated successfully" : "Faculty added successfully");
        elements.editModal.classList.add("hidden");
        loadAdminProfiles();
      } else {
        showToast(data.message || (profileId ? "Failed to update profile" : "Failed to add faculty"), "error");
      }
    } catch (err) {
      console.error(profileId ? "Update profile error:" : "Add faculty error:", err);
      showToast(profileId ? "Failed to update profile" : "Failed to add faculty", "error");
    }
  });
}

// Add Staff (Manager Only)
async function loadEditRequests() {
  const requestedProfiles = profiles.filter((p) => p.edit_requested);
  elements.requestsList.innerHTML = "";

  if (requestedProfiles.length === 0) {
    elements.requestsList.innerHTML =
      '<p class="text-center">No pending edit requests</p>';
    return;
  }

  requestedProfiles.forEach((profile) => {
    const requestCard = document.createElement("div");
    requestCard.className = "request-card glassy";
    requestCard.innerHTML = `
      <div class="request-info">
        <h4>${profile.name}</h4>
        <p>Department: ${profile.department}</p>
        <p>Role: ${profile.role}</p>
        <p>Date of Joining: ${profile.date_of_joining || "Not specified"}</p>
      </div>
      <div class="request-actions">
        <button class="btn glassy-btn btn-success" onclick="approveEdit(${profile.id})">
          Unlock Profile
        </button>
      </div>
    `;
    elements.requestsList.appendChild(requestCard);
  });
}

if (elements.viewRequestsBtn) {
  elements.viewRequestsBtn.addEventListener("click", () => {
    elements.requestsModal.classList.remove("hidden");
    loadEditRequests();
  });
}

if (elements.closeRequests) {
  elements.closeRequests.addEventListener("click", () => {
    elements.requestsModal.classList.add("hidden");
  });
}

if (elements.addStaffBtn) {
  elements.addStaffBtn.addEventListener("click", async () => {
    if (!(await checkToken())) return;
    if (!currentUser || currentUser.role !== "manager") {
      showToast("Only managers can add staff", "error");
      return;
    }
    elements.editModal.classList.remove("hidden");
    elements.editTitle.innerHTML = `<i class="fas fa-user-plus"></i> Add Faculty Profile`;
    elements.profileForm.reset();
    elements.profileForm.id.value = "";
    elements.profileForm
      .querySelector("#email-group")
      .classList.remove("hidden");
    elements.profileForm
      .querySelector("#password-group")
      .classList.remove("hidden");
    elements.profileForm
      .querySelector("#phone-group")
      .classList.remove("hidden");
    elements.profileForm.email.required = true;
    elements.profileForm.password.required = true;
    elements.profileForm.phone_number.required = true;
  });
}

// Export to PDF (unchanged)
if (elements.exportPdf) {
  elements.exportPdf.addEventListener("click", (e) => {
    e.preventDefault();
    const formData = new FormData(elements.profileForm);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SSN IT Faculty Profile", 105, 20, { align: "center" });
    doc.setFontSize(12);
    const content = [
      `Name: ${formData.get("name") || "Unknown"}`,
      `Bio: ${formData.get("bio") || "N/A"}`,
      `Qualifications: ${formData.get("qualifications") || "N/A"}`,
      `Experience: ${formData.get("experience") || "N/A"}`,
      `Research Interests: ${formData.get("research") || "N/A"}`,
    ];
    let y = 40;
    content.forEach((line) => {
      const splitText = doc.splitTextToSize(line, 170);
      splitText.forEach((text) => {
        doc.text(text, 20, y);
        y += 10;
      });
    });
    doc.save(`${formData.get("name") || "faculty"}_SSN_Profile.pdf`);
    showToast(`Exported PDF for ${formData.get("name") || "faculty"}`);
  });
}

// Close Edit Modal
if (elements.closeEdit) {
  elements.closeEdit.addEventListener("click", () => {
    elements.editModal.classList.add("hidden");
    elements.profileForm.email.required = false;
    elements.profileForm.password.required = false;
    elements.profileForm.phone_number.required = false;
  });
}

// Filter Profiles
if (elements.searchBar)
  elements.searchBar.addEventListener("input", filterProfiles);
if (elements.roleFilter)
  elements.roleFilter.addEventListener("change", filterProfiles);
if (elements.researchFilter)
  elements.researchFilter.addEventListener("change", filterProfiles);
if (elements.experienceFilter)
  elements.experienceFilter.addEventListener("change", filterProfiles);
if (elements.resetFilters) {
  elements.resetFilters.addEventListener("click", () => {
    elements.searchBar.value = "";
    elements.roleFilter.value = "";
    elements.researchFilter.value = "";
    elements.experienceFilter.value = "";
    if (currentUser && currentUser.role === "manager") {
      loadAdminProfiles();
    } else {
      loadProfiles();
    }
  });
}

function filterProfiles() {
  const searchTerm = elements.searchBar.value.toLowerCase();
  const role = elements.roleFilter.value;
  const researchDomain = elements.researchFilter.value.toLowerCase();
  const experienceRange = elements.experienceFilter.value;

  const filtered = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm) ||
      (profile.bio || "").toLowerCase().includes(searchTerm) ||
      (profile.qualifications || "").toLowerCase().includes(searchTerm) ||
      (profile.experience || "").toLowerCase().includes(searchTerm);
    const matchesRole = role ? profile.role === role : true;
    const matchesResearch = researchDomain
      ? (profile.research || "").toLowerCase().includes(researchDomain)
      : true;
    const matchesExperience = matchesExperienceRange(profile.date_of_joining, experienceRange);

    return matchesSearch && matchesRole && matchesResearch && matchesExperience;
  });

  if (currentUser && currentUser.role === "manager") {
    renderAdminProfiles(filtered);
  } else {
    renderProfiles(filtered);
  }
}

// Role Filter
if (document.getElementById("role-filter")) {
  document
    .getElementById("role-filter")
    .addEventListener("change", filterProfiles);
}

// Initialize
async function initialize() {
  const token = localStorage.getItem("token");
  if (token) {
    const isValid = await validateToken(token);
    if (isValid) {
      const userData = await fetchCurrentUser(token);
      if (userData) {
        currentUser = userData;
        currentUser.id = String(userData.id); // Ensure ID consistency
        console.log("Initialized user:", currentUser);
        try {
          const res = await fetch(`${API_URL}/profiles`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch profiles");
          profiles = await res.json();
          profiles.forEach((profile) => {
            profile.role = classifyRole(profile.bio);
          });
          elements.loginBtn.classList.add("hidden");
          elements.logoutBtn.classList.remove("hidden");
          elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
          if (currentUser.role === "manager") {
            elements.adminDashboard.classList.remove("hidden");
            elements.profileGrid.classList.add("hidden");
            loadAdminProfiles();
          } else {
            loadProfiles();
          }
        } catch (err) {
          console.error("Failed to fetch profiles:", err);
          logout();
        }
      } else {
        logout();
      }
    } else {
      logout();
    }
  } else {
    loadProfiles(); // Public access
  }
}

initialize();

// Helper function to calculate years of experience
function calculateExperience(dateOfJoining) {
  if (!dateOfJoining) return 0;
  const joiningDate = new Date(dateOfJoining);
  const today = new Date();
  const diffTime = Math.abs(today - joiningDate);
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
}

// Helper function to check if experience matches the selected range
function matchesExperienceRange(experience, range) {
  if (!range) return true;
  
  const years = calculateExperience(experience);
  
  switch (range) {
    case "0-5":
      return years >= 0 && years < 5;
    case "5-10":
      return years >= 5 && years < 10;
    case "10-15":
      return years >= 10 && years < 15;
    case "15-20":
      return years >= 15 && years < 20;
    case "20+":
      return years >= 20;
    default:
      return true;
  }
}
