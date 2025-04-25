const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Email Configuration
const EMAIL_USER = process.env.EMAIL_USER || "ssnitfacultysystem@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "bbrl uydc tzwj uugh";

// Validate email configuration
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error(
    "Email configuration is incomplete. Please check environment variables."
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  maxConnections: 3,
  pool: true,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 3,
  debug: true, // Enable debug logs
});

// Function to clean up orphaned files with enhanced error handling
const cleanupOrphanedFiles = async () => {
  let filesDeleted = 0;
  let errors = [];
  try {
    console.log("Running orphaned files cleanup...");
    const uploadedFiles = await fs.promises.readdir(uploadDir);
    const dbFiles = await allQuery(
      "SELECT profile_pic, tenth_cert, twelfth_cert, appointment_order, joining_report, ug_degree, pg_ms_consolidated, phd_degree, journals_list, conferences_list, au_supervisor_letter, fdp_workshops_webinars, nptel_coursera, invited_talks, projects_sanction, consultancy, patent, community_cert, aadhar, pan FROM profiles",
      []
    );

    // Extract all file paths from database
    const dbFilePaths = new Set();
    dbFiles.forEach((profile) => {
      Object.values(profile).forEach((value) => {
        if (
          value &&
          typeof value === "string" &&
          value.startsWith("/uploads/")
        ) {
          dbFilePaths.add(path.basename(value));
        }
      });
    });

    // Check each file in uploads directory
    for (const file of uploadedFiles) {
      if (file === "placeholder.jpg") continue; // Skip placeholder

      if (!dbFilePaths.has(file)) {
        const filePath = path.join(uploadDir, file);
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up orphaned file: ${filePath}`);
      }
    }
    console.log("Orphaned files cleanup completed");
  } catch (err) {
    console.error("Error during orphaned files cleanup:", err);
  }
};

// Log email configuration status
console.log(`Email configuration using: ${EMAIL_USER}`);
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn(
    "Warning: Email credentials not properly set. Please check your configuration."
  );
}

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Email Template Function
const getRegistrationEmailContent = (name, email, password) => {
  return {
    subject: "Welcome to SSN Faculty Profile System",
    text: `Dear ${name},

Your faculty profile has been created in the SSN Faculty Profile System.

Login Details:
Email: ${email}
Password: ${password}

Please login to complete your profile setup.

Best regards,
SSN Faculty Profile System`,
  };
};

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-very-secure-secret-key-1234567890";

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File Upload Setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// SQLite Database
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite database - SSN College of Engineering");
});

// Database Schema and Conditional Seeding
db.serialize(async () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone_number TEXT,
      role TEXT NOT NULL CHECK(role IN ('staff', 'manager'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      department TEXT NOT NULL DEFAULT 'IT',
      role TEXT NOT NULL DEFAULT 'Assistant Professor',
      bio TEXT,
      profile_pic TEXT,
      qualifications TEXT,
      date_of_joining TEXT,
      experience TEXT,
      research TEXT,
      tenth_cert TEXT,
      twelfth_cert TEXT,
      appointment_order TEXT,
      joining_report TEXT,
      ug_degree TEXT,
      pg_ms_consolidated TEXT,
      phd_degree TEXT,
      journals_list TEXT,
      conferences_list TEXT,
      au_supervisor_letter TEXT,
      fdp_workshops_webinars TEXT,
      nptel_coursera TEXT,
      invited_talks TEXT,
      projects_sanction TEXT,
      consultancy TEXT,
      patent TEXT,
      community_cert TEXT,
      aadhar TEXT,
      pan TEXT,
      is_locked BOOLEAN DEFAULT FALSE,
      lock_expiry TEXT,
      edit_requested BOOLEAN DEFAULT FALSE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const userCount = await new Promise((resolve) => {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (err) {
        console.error("Error checking users table:", err);
        resolve(-1);
      } else {
        resolve(row.count);
      }
    });
  });

  if (userCount === 0) {
    console.log(
      "No users found, seeding initial data for SSN College of Engineering..."
    );
    try {
      const hashAdmin = await bcrypt.hash("admin123", 10);
      await runQuery(
        "INSERT INTO users (email, password, phone_number, role) VALUES (?, ?, ?, ?)",
        ["admin@ssn.edu.in", hashAdmin, "1234567890", "manager"],
        (err) => {
          if (!err)
            console.log(
              "Seeded admin@ssn.edu.in / admin123 / 1234567890 (manager)"
            );
          else console.error("Admin seeding error:", err);
        }
      );

      const hashStaff = await bcrypt.hash("mike789", 10);
      await runQuery(
        "INSERT INTO users (email, password, phone_number, role) VALUES (?, ?, ?, ?)",
        ["mike.lee@ssn.edu.in", hashStaff, "4445556666", "staff"],
        (err) => {
          if (!err)
            console.log(
              "Seeded mike.lee@ssn.edu.in / mike789 / 4445556666 (staff - IT)"
            );
          else console.error("Staff seeding error:", err);
        }
      );
      await runQuery(
        "INSERT INTO profiles (user_id, name, department, bio) VALUES (?, ?, ?, ?)",
        [2, "Dr. Mike Lee", "IT", "Information Technology Specialist"],
        (err) => {
          if (err) console.error("Profile seeding error:", err);
        }
      );
    } catch (err) {
      console.error("Seeding failed:", err);
    }
  } else {
    console.log("Users table already populated, skipping seeding.");
  }
});

// Database Query Helpers
const runQuery = (query, params, callback) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        if (callback) callback(err);
        reject(err);
      } else {
        if (callback) callback(null);
        resolve(this);
      }
    });
  });

// Helper function to delete file if it exists
const deleteFileIfExists = async (filePath) => {
  if (!filePath || !filePath.startsWith("/uploads/")) return;
  const fullPath = path.join(__dirname, filePath);
  try {
    await fs.promises.access(fullPath);
    await fs.promises.unlink(fullPath);
    console.log(`Deleted file: ${filePath}`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
};

// Helper function to delete all profile files
const deleteProfileFiles = async (profile) => {
  const fileFields = [
    "profile_pic",
    "tenth_cert",
    "twelfth_cert",
    "appointment_order",
    "joining_report",
    "ug_degree",
    "pg_ms_consolidated",
    "phd_degree",
    "journals_list",
    "conferences_list",
    "au_supervisor_letter",
    "fdp_workshops_webinars",
    "nptel_coursera",
    "invited_talks",
    "projects_sanction",
    "consultancy",
    "patent",
    "community_cert",
    "aadhar",
    "pan",
  ];

  for (const field of fileFields) {
    if (profile[field]) {
      await deleteFileIfExists(profile[field]);
    }
  }
};

const getQuery = (query, params) =>
  new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const allQuery = (query, params) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Invalid token:", err.message);
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// API Endpoints

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }
  try {
    const user = await getQuery("SELECT * FROM users WHERE email = ?", [email]);
    console.log("Login attempt for:", email, "User found:", user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`Login failed: Invalid credentials for ${email}`);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(`User logged in: ${email}`);
    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

// Get Current User
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await getQuery(
      "SELECT id, email, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const profile = await getQuery(
      "SELECT id, name, is_locked, lock_expiry FROM profiles WHERE user_id = ?",
      [req.user.id]
    );
    console.log(`Fetched current user: ${req.user.email}`);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId: profile?.id || null,
        name: profile?.name || null,
        is_locked: profile?.is_locked || false,
        lock_expiry: profile?.lock_expiry || null,
      },
    });
  } catch (err) {
    console.error("Fetch current user error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

// Get All Profiles (Public)
app.get("/profiles", async (req, res) => {
  try {
    const profiles = await allQuery("SELECT * FROM profiles", []);
    console.log("Fetched IT faculty profiles:", profiles.length, profiles);
    res.json(profiles);
  } catch (err) {
    console.error("Fetch profiles error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

// Get Single Profile (Public)
app.get("/profiles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await getQuery("SELECT * FROM profiles WHERE id = ?", [id]);
    if (profile) {
      console.log(`Fetched IT faculty profile ${id}:`, profile);
      res.json(profile);
    } else {
      console.log(`IT faculty profile not found: ${id}`);
      res.status(404).json({ success: false, message: "Profile not found" });
    }
  } catch (err) {
    console.error("Fetch profile error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

// Delete Faculty Profile (Owner or Manager)
app.delete('/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const profileId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch the profile to check ownership and get file paths
    db.get('SELECT * FROM profiles WHERE id = ?', [profileId], async (err, profile) => {
      if (err) {
        console.error('Error fetching profile:', err);
        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
      }
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }
      if (String(userId) !== String(profile.user_id) && userRole !== 'manager') {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this profile' });
      }

      // Delete associated files (if any)
      const fileFields = [
        'profile_pic', 'tenth_cert', 'twelfth_cert', 'appointment_order', 'joining_report',
        'ug_degree', 'pg_ms_consolidated', 'phd_degree', 'journals_list', 'conferences_list',
        'au_supervisor_letter', 'fdp_workshops_webinars', 'nptel_coursera', 'invited_talks',
        'projects_sanction', 'consultancy', 'patent', 'community_cert', 'aadhar', 'pan'
      ];
      fileFields.forEach(field => {
        if (profile[field]) {
          const filePath = path.join(__dirname, 'uploads', path.basename(profile[field]));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });

      // Delete the profile from the database
      db.run('DELETE FROM profiles WHERE id = ?', [profileId], function (err) {
        if (err) {
          console.error('Error deleting profile:', err);
          return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
        }
        res.json({ success: true, message: 'Profile and files deleted.' });
      });
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Add Faculty (Manager Only)
app.post(
  "/profiles",
  authenticateToken,
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "tenth_cert", maxCount: 1 },
    { name: "twelfth_cert", maxCount: 1 },
    { name: "appointment_order", maxCount: 1 },
    { name: "joining_report", maxCount: 1 },
    { name: "ug_degree", maxCount: 1 },
    { name: "pg_ms_consolidated", maxCount: 1 },
    { name: "phd_degree", maxCount: 1 },
    { name: "journals_list", maxCount: 1 },
    { name: "conferences_list", maxCount: 1 },
    { name: "au_supervisor_letter", maxCount: 1 },
    { name: "fdp_workshops_webinars", maxCount: 1 },
    { name: "nptel_coursera", maxCount: 1 },
    { name: "invited_talks", maxCount: 1 },
    { name: "projects_sanction", maxCount: 1 },
    { name: "consultancy", maxCount: 1 },
    { name: "patent", maxCount: 1 },
    { name: "community_cert", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
  ]),
  async (req, res) => {
    if (req.user.role !== "manager") {
      console.log(`Unauthorized add attempt by ${req.user.email}`);
      return res
        .status(403)
        .json({ success: false, message: "Manager access required" });
    }
    const {
      email,
      password,
      phone_number,
      name,
      bio,
      qualifications,
      date_of_joining,
      experience,
      research,
    } = req.body;

    const files = req.files || {};
    const profilePic = files.profile_pic
      ? `/uploads/${files.profile_pic[0].filename}`
      : null;
    const tenthCert = files.tenth_cert
      ? `/uploads/${files.tenth_cert[0].filename}`
      : null;
    const twelfthCert = files.twelfth_cert
      ? `/uploads/${files.twelfth_cert[0].filename}`
      : null;
    const appointmentOrder = files.appointment_order
      ? `/uploads/${files.appointment_order[0].filename}`
      : null;
    const joiningReport = files.joining_report
      ? `/uploads/${files.joining_report[0].filename}`
      : null;
    const ugDegree = files.ug_degree
      ? `/uploads/${files.ug_degree[0].filename}`
      : null;
    const pgMsConsolidated = files.pg_ms_consolidated
      ? `/uploads/${files.pg_ms_consolidated[0].filename}`
      : null;
    const phdDegree = files.phd_degree
      ? `/uploads/${files.phd_degree[0].filename}`
      : null;
    const journalsList = files.journals_list
      ? `/uploads/${files.journals_list[0].filename}`
      : null;
    const conferencesList = files.conferences_list
      ? `/uploads/${files.conferences_list[0].filename}`
      : null;
    const auSupervisorLetter = files.au_supervisor_letter
      ? `/uploads/${files.au_supervisor_letter[0].filename}`
      : null;
    const fdpWorkshopsWebinars = files.fdp_workshops_webinars
      ? `/uploads/${files.fdp_workshops_webinars[0].filename}`
      : null;
    const nptelCoursera = files.nptel_coursera
      ? `/uploads/${files.nptel_coursera[0].filename}`
      : null;
    const invitedTalks = files.invited_talks
      ? `/uploads/${files.invited_talks[0].filename}`
      : null;
    const projectsSanction = files.projects_sanction
      ? `/uploads/${files.projects_sanction[0].filename}`
      : null;
    const consultancy = files.consultancy
      ? `/uploads/${files.consultancy[0].filename}`
      : null;
    const patent = files.patent ? `/uploads/${files.patent[0].filename}` : null;
    const communityCert = files.community_cert
      ? `/uploads/${files.community_cert[0].filename}`
      : null;
    const aadhar = files.aadhar ? `/uploads/${files.aadhar[0].filename}` : null;
    const pan = files.pan ? `/uploads/${files.pan[0].filename}` : null;

    console.log("Adding faculty:", { email, phone_number, name, profilePic, date_of_joining });

    if (!email || !password || !name) {
      console.log("Missing required fields:", {
        email,
        password,
        name,
      });
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const userResult = await runQuery(
        "INSERT INTO users (email, password, phone_number, role) VALUES (?, ?, ?, ?)",
        [email, hash, phone_number, "staff"]
      );
      const userId = userResult.lastID;

      const profileResult = await runQuery(
        "INSERT INTO profiles (user_id, name, department, bio, profile_pic, qualifications, date_of_joining, experience, research, tenth_cert, twelfth_cert, appointment_order, joining_report, ug_degree, pg_ms_consolidated, phd_degree, journals_list, conferences_list, au_supervisor_letter, fdp_workshops_webinars, nptel_coursera, invited_talks, projects_sanction, consultancy, patent, community_cert, aadhar, pan, is_locked, lock_expiry, edit_requested) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          name,
          "IT",
          bio || "",
          profilePic || null,
          qualifications || "",
          date_of_joining || null,
          experience || "",
          research || "",
          tenthCert || null,
          twelfthCert || null,
          appointmentOrder || null,
          joiningReport || null,
          ugDegree || null,
          pgMsConsolidated || null,
          phdDegree || null,
          journalsList || null,
          conferencesList || null,
          auSupervisorLetter || null,
          fdpWorkshopsWebinars || null,
          nptelCoursera || null,
          invitedTalks || null,
          projectsSanction || null,
          consultancy || null,
          patent || null,
          communityCert || null,
          aadhar || null,
          pan || null,
          false, //is_locked initially false
          null, //lock_expiry initially null
          false, //edit_requested initially false
        ]
      );
      const newProfile = await getQuery("SELECT * FROM profiles WHERE id = ?", [
        profileResult.lastID,
      ]);

      // Send registration email with improved retry mechanism
      let emailSent = false;
      let retryCount = 0;
      const maxRetries = 5;

      // Prepare email content
      const emailContent = getRegistrationEmailContent(name, email, password);

      const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to SSN Faculty Profile System</h2>
        <p>Dear ${name},</p>
        <p>Your faculty profile has been created in the SSN Faculty Profile System.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Login Details:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please login to complete your profile setup.</p>
        <p>Best regards,<br>SSN Faculty Profile System</p>
      </div>`;

      // Email sending function with retry logic
      const sendEmailWithRetry = async () => {
        while (!emailSent && retryCount < maxRetries) {
          try {
            const mailOptions = {
              from: `"SSN Faculty System" <${EMAIL_USER}>`,
              to: email,
              subject: emailContent.subject,
              text: emailContent.text,
              html: htmlContent,
              priority: "high",
              headers: {
                "X-Priority": "1",
                "X-MSMail-Priority": "High",
                Importance: "High",
              },
            };

            const info = await transporter.sendMail(mailOptions);
            emailSent = true;
            console.log(
              `Registration email sent successfully to ${email} on attempt ${
                retryCount + 1
              }. MessageID: ${info.messageId}`
            );
            return true;
          } catch (emailErr) {
            retryCount++;
            console.error(
              `Email sending attempt ${retryCount} failed for ${email}:`,
              emailErr.message
            );
            if (retryCount < maxRetries) {
              const delay = retryCount * 2000; // Increasing delay with each retry
              console.log(
                `Retrying email send to ${email} in ${delay / 1000} seconds...`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              console.error(
                `Failed to send email to ${email} after ${maxRetries} attempts. Last error: ${emailErr.message}`
              );
              return false;
            }
          }
        }
      };

      // Execute email sending
      await sendEmailWithRetry();

      console.log(
        `Faculty added: ${name} (ID: ${profileResult.lastID}) by ${req.user.email}`
      );
      res.json({
        success: true,
        profile: newProfile,
        message: "Faculty added successfully",
      });
    } catch (err) {
      console.error("Add faculty error:", err);
      res
        .status(500)
        .json({ success: false, message: "Server error: " + err.message });
    }
  }
);

// Update Faculty Profile
app.put(
  "/profiles/:id",
  authenticateToken,
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const profile = await getQuery("SELECT * FROM profiles WHERE id = ?", [id]);
      if (!profile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }

      if (profile.is_locked) {
        const now = new Date();
        const expiry = new Date(profile.lock_expiry);

        if (now < expiry && req.user.role !== "manager") {
          return res.status(403).json({
            success: false,
            message: "Profile is locked. Please request edit access from admin.",
          });
        }

        if (now >= expiry) {
          await runQuery(
            "UPDATE profiles SET is_locked = TRUE, lock_expiry = NULL WHERE id = ?",
            [id]
          );
        }
      }
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error: " + err.message });
    }
  },
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "tenth_cert", maxCount: 1 },
    { name: "twelfth_cert", maxCount: 1 },
    { name: "appointment_order", maxCount: 1 },
    { name: "joining_report", maxCount: 1 },
    { name: "ug_degree", maxCount: 1 },
    { name: "pg_ms_consolidated", maxCount: 1 },
    { name: "phd_degree", maxCount: 1 },
    { name: "journals_list", maxCount: 1 },
    { name: "conferences_list", maxCount: 1 },
    { name: "au_supervisor_letter", maxCount: 1 },
    { name: "fdp_workshops_webinars", maxCount: 1 },
    { name: "nptel_coursera", maxCount: 1 },
    { name: "invited_talks", maxCount: 1 },
    { name: "projects_sanction", maxCount: 1 },
    { name: "consultancy", maxCount: 1 },
    { name: "patent", maxCount: 1 },
    { name: "community_cert", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 }
  ]),
  async (req, res) => {
    const { id } = req.params;
    const { name, bio, qualifications, experience, research, email, phone_number } = req.body;

    const files = req.files || {};
    const profilePic = files.profile_pic
      ? `/uploads/${files.profile_pic[0].filename}`
      : null;
    const tenthCert = files.tenth_cert
      ? `/uploads/${files.tenth_cert[0].filename}`
      : null;
    const twelfthCert = files.twelfth_cert
      ? `/uploads/${files.twelfth_cert[0].filename}`
      : null;
    const appointmentOrder = files.appointment_order
      ? `/uploads/${files.appointment_order[0].filename}`
      : null;
    const joiningReport = files.joining_report
      ? `/uploads/${files.joining_report[0].filename}`
      : null;
    const ugDegree = files.ug_degree
      ? `/uploads/${files.ug_degree[0].filename}`
      : null;
    const pgMsConsolidated = files.pg_ms_consolidated
      ? `/uploads/${files.pg_ms_consolidated[0].filename}`
      : null;
    const phdDegree = files.phd_degree
      ? `/uploads/${files.phd_degree[0].filename}`
      : null;
    const journalsList = files.journals_list
      ? `/uploads/${files.journals_list[0].filename}`
      : null;
    const conferencesList = files.conferences_list
      ? `/uploads/${files.conferences_list[0].filename}`
      : null;
    const auSupervisorLetter = files.au_supervisor_letter
      ? `/uploads/${files.au_supervisor_letter[0].filename}`
      : null;
    const fdpWorkshopsWebinars = files.fdp_workshops_webinars
      ? `/uploads/${files.fdp_workshops_webinars[0].filename}`
      : null;
    const nptelCoursera = files.nptel_coursera
      ? `/uploads/${files.nptel_coursera[0].filename}`
      : null;
    const invitedTalks = files.invited_talks
      ? `/uploads/${files.invited_talks[0].filename}`
      : null;
    const projectsSanction = files.projects_sanction
      ? `/uploads/${files.projects_sanction[0].filename}`
      : null;
    const consultancy = files.consultancy
      ? `/uploads/${files.consultancy[0].filename}`
      : null;
    const patent = files.patent ? `/uploads/${files.patent[0].filename}` : null;
    const communityCert = files.community_cert
      ? `/uploads/${files.community_cert[0].filename}`
      : null;
    const aadhar = files.aadhar ? `/uploads/${files.aadhar[0].filename}` : null;
    const pan = files.pan ? `/uploads/${files.pan[0].filename}` : null;

    console.log("Update request:", { id, name, bio, profilePic, email, phone_number });

    if (!name) {
      console.log("Missing required field: name");
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    try {
      const profile = await getQuery("SELECT * FROM profiles WHERE id = ?", [
        id,
      ]);
      if (!profile) {
        console.log(`Faculty profile not found: ${id}`);
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      if (req.user.role !== "manager" && req.user.id !== profile.user_id) {
        console.log(
          `Unauthorized update by ${req.user.email} on profile ${id}`
        );
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Can only edit own profile",
        });
      }

      // Update user information if provided (only email and phone number)
      if (email || phone_number) {
        try {
          // First check if email exists for another user
          if (email) {
            const existingUser = await getQuery(
              "SELECT id FROM users WHERE email = ? AND id != ?",
              [email, profile.user_id]
            );
            if (existingUser) {
              return res.status(400).json({
                success: false,
                message: "Email already exists for another user"
              });
            }
          }

          // If email check passed, proceed with update
          const userUpdateFields = [];
          const userUpdateParams = [];
          
          if (email) {
            userUpdateFields.push("email = ?");
            userUpdateParams.push(email);
          }
          
          if (phone_number) {
            userUpdateFields.push("phone_number = ?");
            userUpdateParams.push(phone_number);
          }
          
          if (userUpdateFields.length > 0) {
            userUpdateParams.push(profile.user_id);
            const userUpdateQuery = `UPDATE users SET ${userUpdateFields.join(", ")} WHERE id = ?`;
            await runQuery(userUpdateQuery, userUpdateParams);
          }
        } catch (err) {
          console.error("User update error:", err);
          if (err.message.includes("UNIQUE constraint failed: users.email")) {
            return res.status(400).json({
              success: false,
              message: "Email already exists for another user"
            });
          }
          throw err; // Re-throw other errors to be caught by outer catch
        }
      }

      const oldFiles = [
        profile.profile_pic,
        profile.tenth_cert,
        profile.twelfth_cert,
        profile.appointment_order,
        profile.joining_report,
        profile.ug_degree,
        profile.pg_ms_consolidated,
        profile.phd_degree,
        profile.journals_list,
        profile.conferences_list,
        profile.au_supervisor_letter,
        profile.fdp_workshops_webinars,
        profile.nptel_coursera,
        profile.invited_talks,
        profile.projects_sanction,
        profile.consultancy,
        profile.patent,
        profile.community_cert,
        profile.aadhar,
        profile.pan,
      ];
      const newFiles = [
        profilePic,
        tenthCert,
        twelfthCert,
        appointmentOrder,
        joiningReport,
        ugDegree,
        pgMsConsolidated,
        phdDegree,
        journalsList,
        conferencesList,
        auSupervisorLetter,
        fdpWorkshopsWebinars,
        nptelCoursera,
        invitedTalks,
        projectsSanction,
        consultancy,
        patent,
        communityCert,
        aadhar,
        pan,
      ];
      oldFiles.forEach((oldFile, index) => {
        if (
          newFiles[index] &&
          oldFile &&
          fs.existsSync(path.join(__dirname, oldFile))
        ) {
          fs.unlinkSync(path.join(__dirname, oldFile));
          console.log(`Deleted old file: ${oldFile}`);
        }
      });

      const updateQuery = `
        UPDATE profiles SET 
          name = ?, department = 'IT', bio = ?, profile_pic = COALESCE(?, profile_pic), 
          qualifications = ?, experience = ?, research = ?,
          tenth_cert = COALESCE(?, tenth_cert), twelfth_cert = COALESCE(?, twelfth_cert),
          appointment_order = COALESCE(?, appointment_order), joining_report = COALESCE(?, joining_report),
          ug_degree = COALESCE(?, ug_degree), pg_ms_consolidated = COALESCE(?, pg_ms_consolidated),
          phd_degree = COALESCE(?, phd_degree), journals_list = COALESCE(?, journals_list),
          conferences_list = COALESCE(?, conferences_list), au_supervisor_letter = COALESCE(?, au_supervisor_letter),
          fdp_workshops_webinars = COALESCE(?, fdp_workshops_webinars), nptel_coursera = COALESCE(?, nptel_coursera),
          invited_talks = COALESCE(?, invited_talks), projects_sanction = COALESCE(?, projects_sanction),
          consultancy = COALESCE(?, consultancy), patent = COALESCE(?, patent),
          community_cert = COALESCE(?, community_cert), aadhar = COALESCE(?, aadhar),
          pan = COALESCE(?, pan), edit_requested = COALESCE(?, edit_requested)
        WHERE id = ?
      `;
      const params = [
        name,
        bio || "",
        profilePic,
        qualifications || "",
        experience || "",
        research || "",
        tenthCert,
        twelfthCert,
        appointmentOrder,
        joiningReport,
        ugDegree,
        pgMsConsolidated,
        phdDegree,
        journalsList,
        conferencesList,
        auSupervisorLetter,
        fdpWorkshopsWebinars,
        nptelCoursera,
        invitedTalks,
        projectsSanction,
        consultancy,
        patent,
        communityCert,
        aadhar,
        pan,
        false, // edit_requested
        id
      ];

      await runQuery(updateQuery, params);
      const updatedProfile = await getQuery(
        "SELECT * FROM profiles WHERE id = ?",
        [id]
      );
      console.log(`Faculty profile updated: ${id}`, updatedProfile);
      res.json({
        success: true,
        profile: updatedProfile,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error("Update profile error:", err);
      if (err.message.includes("UNIQUE constraint failed: users.email")) {
        res.status(400).json({
          success: false,
          message: "Email already exists for another user"
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Server error: " + err.message
        });
      }
    }
  }
);

// Lock/Unlock All Profiles
app.post("/profiles/lock-all", authenticateToken, async (req, res) => {
  if (req.user.role !== "manager") {
    return res
      .status(403)
      .json({ success: false, message: "Manager access required" });
  }

  const { lock } = req.body;
  try {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    await runQuery(
      "UPDATE profiles SET is_locked = ?, lock_expiry = ? WHERE 1",
      [lock ? 1 : 0, lock ? expiry.toISOString() : null]
    );
    res.json({
      success: true,
      message: `All profiles ${lock ? "locked" : "unlocked"} successfully`
    });
  } catch (err) {
    console.error("Lock/unlock profiles error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

// Lock/Unlock a profile
app.post("/profiles/:id/lock", (req, res) => {
  const profileId = req.params.id;
  const { lock } = req.body; // expects { lock: true } or { lock: false }
  db.run(
    "UPDATE profiles SET is_locked = ? WHERE id = ?",
    [lock ? 1 : 0, profileId],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to update lock status" });
      }
      res.json({ success: true, locked: !!lock });
    }
  );
});

// Get User by ID
app.get("/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getQuery("SELECT id, email, phone_number, role FROM users WHERE id = ?", [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Add this route to handle edit requests
app.post('/profiles/:id/request-edit', authenticateToken, async (req, res) => {
  const profileId = req.params.id;
  const requestingUserId = req.user.id;

  try {
    // Check if the user is a staff member
    if (req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Only staff members can request edits' });
    }

    // Update the profile's edit_requested status
    const updateQuery = `
      UPDATE profiles 
      SET edit_requested = TRUE 
      WHERE id = ? AND user_id = ?
    `;
    
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [profileId, requestingUserId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get manager emails to notify them
    const managerQuery = `
      SELECT email FROM users WHERE role = 'manager'
    `;
    
    const managers = await new Promise((resolve, reject) => {
      db.all(managerQuery, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get the faculty profile details
    const profileQuery = `
      SELECT p.*, u.email as faculty_email 
      FROM profiles p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `;
    
    const profile = await new Promise((resolve, reject) => {
      db.get(profileQuery, [profileId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Send email notifications to managers
    for (const manager of managers) {
      const emailContent = {
        from: EMAIL_USER,
        to: manager.email,
        subject: 'New Faculty Profile Edit Request',
        text: `
          A new edit request has been submitted:
          
          Faculty Name: ${profile.name}
          Faculty Email: ${profile.faculty_email}
          Department: ${profile.department}
          
          Please review the request in the faculty management system.
        `
      };
      
      await transporter.sendMail(emailContent);
    }

    res.json({ success: true, message: 'Edit request submitted successfully' });
  } catch (err) {
    console.error('Error processing edit request:', err);
    res.status(500).json({ success: false, message: 'Failed to process edit request' });
  }
});

// Approve edit request and unlock profile
app.post("/profiles/:id/approve-edit", (req, res) => {
  const profileId = req.params.id;
  // Only allow managers to approve
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (user.role !== "manager") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  db.run(
    "UPDATE profiles SET edit_requested = 0, is_locked = 0 WHERE id = ?",
    [profileId],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
      res.json({ success: true, message: "Profile unlocked and edit approved" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
