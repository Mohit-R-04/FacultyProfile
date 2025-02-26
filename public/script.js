const API_URL =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";
console.log("App running on:", API_URL);
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
  resetFilters: document.getElementById("reset-filters"),
  collapseSidebar: document.getElementById("collapse-sidebar"),
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
    elements.adminDashboard.classList.add("hidden");
    fetchProfiles();
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
        if (currentUser.role === "manager")
          elements.adminDashboard.classList.remove("hidden");
        fetchProfiles();
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

// Forgot Password
if (elements.forgotPasswordBtn) {
  elements.forgotPasswordBtn.addEventListener("click", () => {
    elements.loginModal.classList.add("hidden");
    elements.forgotPasswordModal.classList.remove("hidden");
  });
}

if (elements.closeForgotPassword) {
  elements.closeForgotPassword.addEventListener("click", () => {
    elements.forgotPasswordModal.classList.add("hidden");
  });
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
        showToast("Password reset successfully, please login");
        elements.loginModal.classList.remove("hidden");
      } else {
        showToast("Reset failed: " + data.message, "error");
      }
    } catch (err) {
      showToast("Server error during reset: " + err.message, "error");
      console.error(err);
    }
  });
}

// Fetch Profiles
async function fetchProfiles() {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/profiles`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
    profiles = await res.json();
    console.log("Fetched IT profiles:", profiles);
    renderProfiles(profiles);
    if (currentUser?.role === "manager") renderAdminDashboard();
  } catch (err) {
    showToast("Failed to load IT faculty profiles: " + err.message, "error");
    console.error(err);
  }
}

// Render Profiles
function renderProfiles(data) {
  if (!elements.profileGrid) {
    console.error("Profile grid element not found");
    return;
  }
  elements.profileGrid.innerHTML = "";
  if (!data || !data.length) {
    elements.profileGrid.innerHTML =
      '<div class="grid-placeholder">No IT faculty profiles found</div>';
    return;
  }
  data.forEach((profile) => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <div class="card-header">
        <img src="${
          profile.profile_pic
            ? `${API_URL}${profile.profile_pic}?t=${Date.now()}`
            : "https://via.placeholder.com/100"
        }" alt="${profile.name}" class="card-avatar">
        <h3>${profile.name}</h3>
      </div>
      <div class="card-body">
        <p><i class="fas fa-info-circle"></i> ${
          profile.bio?.substring(0, 50) || "No bio"
        }...</p>
      </div>
      <div class="card-actions">
        <button onclick="window.location.href='/faculty-profile.html?id=${
          profile.id
        }'" class="btn btn-primary btn-small">
          <i class="fas fa-eye"></i> View
        </button>
        ${
          currentUser &&
          (currentUser.id === profile.user_id.toString() ||
            currentUser.role === "manager")
            ? `
          <button onclick="editProfile('${
            profile.id
          }')" class="btn btn-secondary btn-small">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${
            currentUser.role === "manager"
              ? `
            <button onclick="deleteProfile('${profile.id}')" class="btn btn-danger btn-small">
              <i class="fas fa-trash"></i> Delete
            </button>
          `
              : ""
          }`
            : ""
        }
      </div>
    `;
    elements.profileGrid.appendChild(card);
  });
  updateStats(data);
}

// Render Admin Dashboard
function renderAdminDashboard() {
  if (!elements.adminProfiles) {
    console.error("Admin profiles element not found");
    return;
  }
  elements.adminProfiles.innerHTML = "";
  profiles.forEach((profile) => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <h3>${profile.name}</h3>
      <div class="card-actions">
        <button onclick="editProfile('${profile.id}')" class="btn btn-secondary btn-small">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button onclick="deleteProfile('${profile.id}')" class="btn btn-danger btn-small">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    elements.adminProfiles.appendChild(card);
  });
}

// Update Stats
function updateStats(data) {
  if (elements.totalStaff) elements.totalStaff.textContent = data.length || 0;
}

// Edit Profile
function editProfile(id) {
  console.log("Editing profile with ID:", id);
  if (!id) {
    showToast("Invalid profile ID", "error");
    return;
  }
  const profile = profiles.find((p) => p.id === id); // Changed from _id to id
  if (!currentUser) {
    showToast("Please login to edit profiles", "error");
    return;
  }
  if (
    currentUser.id !== profile.user_id.toString() &&
    currentUser.role !== "manager"
  ) {
    showToast("Unauthorized: You can only edit your own profile", "error");
    return;
  }
  elements.editTitle.innerHTML = `<i class="fas fa-user-edit"></i> Edit IT Faculty Profile`;
  elements.profileForm.id.value = profile.id; // Changed from _id to id
  elements.profileForm.name.value = profile.name;
  elements.profileForm.bio.value = profile.bio || "";
  elements.profileForm.research.value = profile.research || "";
  elements.profileForm.qualifications.value = profile.qualifications || "";
  elements.profileForm.experience.value = profile.experience || "";
  elements.profileForm.profile_pic.value = "";
  elements.profileForm.querySelector("#email-group").style.display = "none";
  elements.profileForm.querySelector("#password-group").style.display = "none";
  elements.profileForm.querySelector("#phone-group").style.display = "none";
  elements.editModal.classList.remove("hidden");

  elements.profileForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.profileForm);
    console.log("Sending update request:", Array.from(formData.entries()));
    try {
      const res = await fetch(`${API_URL}/profiles/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();
      console.log("Update response:", data);
      if (data.success) {
        elements.editModal.classList.add("hidden");
        const index = profiles.findIndex((p) => p.id === id); // Changed from _id to id
        profiles[index] = data.profile;
        renderProfiles(profiles);
        if (currentUser.role === "manager") renderAdminDashboard();
        showToast(`IT faculty profile updated: ${formData.get("name")}`);
      } else {
        showToast(`Failed to update IT faculty: ${data.message}`, "error");
      }
    } catch (err) {
      showToast("Server error during update: " + err.message, "error");
      console.error(err);
    }
  };
}

if (elements.closeEdit) {
  elements.closeEdit.addEventListener("click", () =>
    elements.editModal.classList.add("hidden")
  );
}

// Add Staff (Admin Only)
if (elements.addStaffBtn) {
  elements.addStaffBtn.addEventListener("click", () => {
    if (!currentUser || currentUser.role !== "manager") {
      showToast("Unauthorized: Only managers can add IT faculty", "error");
      return;
    }
    elements.editTitle.innerHTML = `<i class="fas fa-user-plus"></i> Add IT Faculty`;
    elements.profileForm.reset();
    elements.profileForm.id.value = "";
    elements.profileForm.querySelector("#email-group").style.display = "block";
    elements.profileForm.querySelector("#password-group").style.display =
      "block";
    elements.profileForm.querySelector("#phone-group").style.display = "block";
    elements.profileForm
      .querySelector("#edit-email")
      .setAttribute("required", "true");
    elements.profileForm
      .querySelector("#edit-password")
      .setAttribute("required", "true");
    elements.profileForm
      .querySelector("#edit-phone")
      .setAttribute("required", "true");
    elements.editModal.classList.remove("hidden");

    elements.profileForm.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(elements.profileForm);
      console.log("Sending add request:", Array.from(formData.entries()));
      try {
        const res = await fetch(`${API_URL}/profiles`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        });
        const data = await res.json();
        console.log("Add response:", data);
        if (data.success) {
          elements.editModal.classList.add("hidden");
          profiles.push(data.profile);
          renderProfiles(profiles);
          if (currentUser.role === "manager") renderAdminDashboard();
          showToast(`IT faculty added: ${formData.get("name")}`);
          // Redirect to the new faculty profile
          window.location.href = `/faculty-profile.html?id=${data.profile.id}`;
        } else {
          showToast(`Failed to add IT faculty: ${data.message}`, "error");
        }
      } catch (err) {
        showToast("Server error during creation: " + err.message, "error");
        console.error(err);
      }
    };
  });
}

// Delete Profile
async function deleteProfile(id) {
  console.log("Deleting profile with ID:", id);
  if (!id) {
    showToast("Invalid profile ID", "error");
    return;
  }
  if (!currentUser || currentUser.role !== "manager") {
    showToast("Unauthorized: Only managers can delete IT faculty", "error");
    return;
  }
  if (confirm("Are you sure you want to delete this IT faculty profile?")) {
    try {
      const res = await fetch(`${API_URL}/profiles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      console.log("Delete response:", data);
      if (data.success) {
        profiles = profiles.filter((p) => p.id !== id); // Changed from _id to id
        renderProfiles(profiles);
        if (currentUser.role === "manager") renderAdminDashboard();
        showToast(`IT faculty profile deleted (ID: ${id})`);
      } else {
        showToast(`Failed to delete IT faculty: ${data.message}`, "error");
      }
    } catch (err) {
      showToast("Server error during deletion: " + err.message, "error");
      console.error("Delete error:", err);
    }
  }
}

// Search and Filter (Only by Role and Name)
if (elements.searchBar)
  elements.searchBar.addEventListener("input", filterProfiles);
if (elements.roleFilter)
  elements.roleFilter.addEventListener("change", filterProfiles);
if (elements.resetFilters) {
  elements.resetFilters.addEventListener("click", () => {
    elements.searchBar.value = "";
    elements.roleFilter.value = "";
    renderProfiles(profiles);
  });
}

function filterProfiles() {
  const search = elements.searchBar.value.toLowerCase();
  const role = elements.roleFilter.value;
  const filtered = profiles.filter(
    (p) =>
      (p.name.toLowerCase().includes(search) ||
        p.bio?.toLowerCase().includes(search) ||
        p.research?.toLowerCase().includes(search)) &&
      (!role ||
        (role === "Professor" && p.experience?.includes("Professor")) ||
        (role === "Lecturer" && p.experience?.includes("Lecturer")) ||
        (role === "Researcher" && p.research))
  );
  renderProfiles(filtered);
}

// Sidebar Collapse
if (elements.collapseSidebar) {
  elements.collapseSidebar.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("collapsed");
    elements.collapseSidebar.innerHTML = `<i class="fas fa-chevron-${
      document.querySelector(".sidebar").classList.contains("collapsed")
        ? "right"
        : "left"
    }"></i>`;
  });
}

// Initial Load with Token Validation
async function initialize() {
  const token = localStorage.getItem("token");
  if (token) {
    const isValid = await validateToken(token);
    if (isValid) {
      try {
        const res = await fetch(`${API_URL}/profiles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profiles for user");
        profiles = await res.json();
        currentUser = {
          id: profiles[0]?.user_id.toString(), // Assuming at least one profile exists
          email: localStorage.getItem("email") || "Unknown",
          role:
            localStorage.getItem("email") === "admin@ssn.edu.in"
              ? "manager"
              : "staff",
        };
        elements.loginBtn.classList.add("hidden");
        elements.logoutBtn.classList.remove("hidden");
        elements.userStatus.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email} <span class="role-tag">${currentUser.role}</span>`;
        if (currentUser.role === "manager")
          elements.adminDashboard.classList.remove("hidden");
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
  fetchProfiles();
}

initialize();
