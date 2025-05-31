# 👨‍🏫 Faculty Profile Management System

A lightweight web application built for managing and displaying faculty member profiles. This project streamlines how faculty data—such as qualifications, research, and academic contributions—is uploaded, stored, and presented, particularly useful for college departments and academic websites.

---

## 🚀 Project Overview

Many educational institutions still rely on static pages or manual updates for faculty profiles, leading to inefficiencies and inconsistent information.

This project provides:

- A **user-friendly frontend** to input and view faculty details.
- A **Node.js backend** with a SQLite database for persistence.
- Simple and modular **HTML/CSS/JS** frontend files.
- Image upload capability for faculty photographs.
- Organized directory structure for easy extension.

The current version is a **Minimum Viable Product (MVP)**, ideal for academic administrators or developers creating custom university systems.

---

## 🎯 Core Features

### 1. Faculty Profile Upload

- Admin can add profiles with:
  - Name, Designation, Department
  - Education, Experience, Awards, Publications
  - Image upload (stored in `server/uploads`)

### 2. Profile Display Interface

- A clean UI displays all uploaded faculty members.
- Details like qualifications and research areas shown on hover or click.
- Responsive design with basic CSS styling.

### 3. Backend Logic with Node.js

- Backend API built in `server.js`.
- Upload handling and form processing via Express.js.
- Uses `multer` for handling image uploads.
- SQLite database (`database.db`) stores faculty info.

### 4. Reset and Initialization Scripts

- SQL file (`reset_db.sql`) for initializing/resetting the database.
- Server logs and error handling via `server.log`.

---

## 🧱 Tech Stack

### Frontend

- **HTML / CSS / JavaScript**
- **Vanilla JS** for DOM manipulation
- No external libraries for frontend (lightweight and portable)

### Backend

- **Node.js + Express**
- **SQLite** for database
- **Multer** for image upload middleware

---

## 🗂️ Project Structure

```text
FacultyProfile-main/
├── public/                     # Frontend files
│   ├── index.html              # Main page
│   ├── faculty-profile.html    # Faculty display page
│   ├── faculty-script.js       # Script for profile display
│   ├── script.js               # Handles form interactions
│   ├── styles.css              # Styling
│   └── src/                    # Assets (e.g., logos, default images)
│
├── server/                     # Backend logic
│   ├── server.js               # Express server
│   ├── Bplus.py                # (Potential integration or unused)
│   ├── reset_db.sql            # Database schema reset script
│   ├── database.db             # SQLite DB storing profiles
│   ├── server.log              # Log file for debugging
│   └── uploads/                # Uploaded faculty images
│
├── package.json                # Node dependencies
├── package-lock.json           # Dependency tree
├── Procfile                    # For deployment (e.g., Heroku)
└── .vscode/                    # Editor configuration
```

---

## 💡 Use Cases

- Academic department websites.
- Profile directories for research labs or administrative units.
- Quick-start template for university information systems.

---

## 🔮 Future Scope

- Role-based login for faculty/admins.
- Advanced search and filter by department or publication.
- Integration with external CV formats (e.g., ORCID, Google Scholar).
- Export to PDF or printable view.
- Admin dashboard for bulk editing or CSV import.
