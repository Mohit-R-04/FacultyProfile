const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
const PORT = 3000;
const JWT_SECRET = "your-very-secure-secret-key-1234567890";

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/ssn_faculty", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB - SSN College of Engineering");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone_number: { type: String, unique: true, required: true },
  role: { type: String, enum: ["staff", "manager"], required: true },
});

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  name: { type: String, required: true },
  department: { type: String, required: true, default: "IT" },
  bio: String,
  profile_pic: String,
  qualifications: String,
  experience: String,
  research: String,
});

const User = mongoose.model("User", userSchema);
const Profile = mongoose.model("Profile", profileSchema);

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

// Initial Seeding (Only IT Department)
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding initial data for SSN IT Faculty...");
      const hashAdmin = await bcrypt.hash("admin123", 10);
      const hashStaff1 = await bcrypt.hash("mike789", 10);

      const admin = await new User({
        email: "admin@ssn.edu.in",
        password: hashAdmin,
        phone_number: "1234567890",
        role: "manager",
      }).save();
      console.log("Seeded admin@ssn.edu.in / admin123 / 1234567890 (manager)");

      const staff1 = await new User({
        email: "mike.lee@ssn.edu.in",
        password: hashStaff1,
        phone_number: "4445556666",
        role: "staff",
      }).save();
      await new Profile({
        user_id: staff1._id,
        name: "Dr. Mike Lee",
        department: "IT",
        bio: "Information Technology Specialist",
      }).save();
      console.log(
        "Seeded mike.lee@ssn.edu.in / mike789 / 4445556666 (staff - IT)"
      );
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
};
seedDatabase();

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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`Login failed: Invalid credentials for ${email}`);
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(`User logged in: ${email}`);
    res.json({
      success: true,
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

app.get("/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find({ department: "IT" });
    console.log("Fetched IT faculty profiles:", profiles.length, profiles);
    res.json(profiles);
  } catch (err) {
    console.error("Fetch profiles error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

app.get("/profiles/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(`Invalid profile ID: ${id}`);
    return res
      .status(400)
      .json({ success: false, message: "Invalid profile ID" });
  }
  try {
    const profile = await Profile.findById(id);
    if (profile && profile.department === "IT") {
      console.log(`Fetched IT faculty profile ${id}:`, profile);
      res.json(profile);
    } else {
      console.log(`IT faculty profile not found: ${id}`);
      res.status(404).json({
        success: false,
        message: "Profile not found or not in IT department",
      });
    }
  } catch (err) {
    console.error("Fetch profile error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

app.post(
  "/profiles",
  authenticateToken,
  upload.single("profile_pic"),
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
      research,
      qualifications,
      experience,
    } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

    if (!email || !password || !phone_number || !name) {
      console.log("Missing required fields for add:", {
        email,
        password,
        phone_number,
        name,
      });
      return res.status(400).json({
        success: false,
        message: "Email, password, phone number, and name are required",
      });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await new User({
        email,
        password: hash,
        phone_number,
        role: "staff",
      }).save();

      const profile = await new Profile({
        user_id: user._id,
        name,
        department: "IT",
        bio,
        profile_pic: profilePic,
        research,
        qualifications,
        experience,
      }).save();

      console.log(
        `IT faculty added: ${name} (ID: ${profile._id}) by ${req.user.email}`
      );
      res.json({
        success: true,
        profile,
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

app.put(
  "/profiles/:id",
  authenticateToken,
  upload.single("profile_pic"),
  async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid profile ID: ${id}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid profile ID" });
    }
    const { name, bio, research, qualifications, experience } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("Update request:", {
      id,
      name,
      bio,
      profilePic,
      research,
      qualifications,
      experience,
    });

    if (!name) {
      console.log("Missing required field: name");
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    try {
      const profile = await Profile.findById(id);
      if (!profile || profile.department !== "IT") {
        console.log(`IT faculty profile not found: ${id}`);
        return res.status(404).json({
          success: false,
          message: "Profile not found or not in IT department",
        });
      }

      if (
        req.user.role !== "manager" &&
        req.user.id !== profile.user_id.toString()
      ) {
        console.log(
          `Unauthorized update by ${req.user.email} on profile ${id}`
        );
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Can only edit own profile",
        });
      }

      if (
        profilePic &&
        profile.profile_pic &&
        fs.existsSync(path.join(__dirname, "..", profile.profile_pic))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", profile.profile_pic));
        console.log(
          `Deleted old faculty profile picture: ${profile.profile_pic}`
        );
      }

      profile.name = name;
      profile.bio = bio || profile.bio;
      profile.profile_pic = profilePic || profile.profile_pic;
      profile.research = research || profile.research;
      profile.qualifications = qualifications || profile.qualifications;
      profile.experience = experience || profile.experience;

      const updatedProfile = await profile.save();
      console.log(`IT faculty profile updated: ${id}`, updatedProfile);
      res.json({
        success: true,
        profile: updatedProfile,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error("Update profile error:", err);
      res
        .status(500)
        .json({ success: false, message: "Server error: " + err.message });
    }
  }
);

app.delete("/profiles/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(`Invalid profile ID: ${id}`);
    return res
      .status(400)
      .json({ success: false, message: "Invalid profile ID" });
  }

  if (req.user.role !== "manager") {
    console.log(`Unauthorized delete attempt by ${req.user.email}`);
    return res
      .status(403)
      .json({ success: false, message: "Manager access required" });
  }

  try {
    const profile = await Profile.findById(id);
    if (!profile || profile.department !== "IT") {
      console.log(`IT faculty profile not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Profile not found or not in IT department",
      });
    }

    if (
      profile.profile_pic &&
      fs.existsSync(path.join(__dirname, "..", profile.profile_pic))
    ) {
      fs.unlinkSync(path.join(__dirname, "..", profile.profile_pic));
      console.log(`Deleted faculty profile picture: ${profile.profile_pic}`);
    }

    await Profile.deleteOne({ _id: id });
    console.log(`IT faculty profile deleted: ${id} by ${req.user.email}`);
    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

app.post("/reset-password", async (req, res) => {
  const { phone_number, new_password } = req.body;
  if (!phone_number || !new_password) {
    return res.status(400).json({
      success: false,
      message: "Phone number and new password required",
    });
  }
  try {
    const user = await User.findOne({ phone_number });
    if (!user) {
      console.log(
        `Reset password failed: No user found for phone ${phone_number}`
      );
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }
    const newHash = await bcrypt.hash(new_password, 10);
    user.password = newHash;
    await user.save();
    console.log(`Password reset for user with phone ${phone_number}`);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT} - SSN College of Engineering`
  );
});
