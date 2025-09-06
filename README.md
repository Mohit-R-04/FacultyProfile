# 👨‍🏫 Faculty Profile Management System

A comprehensive full-stack web application built with **Spring Boot 3.2.0** backend and **React 18** frontend for managing and displaying faculty member profiles at SSN College of Engineering. This system streamlines faculty data management, document handling, and profile presentation with modern UI/UX and robust security features.

---

## 🚀 Project Overview

This project provides a complete solution for academic institutions to manage faculty information efficiently:

- **Modern React Frontend** with responsive design, dark/light themes, and intuitive navigation
- **Spring Boot Backend** with JWT authentication, role-based access control, and comprehensive API
- **PostgreSQL Database** for reliable data persistence with JPA/Hibernate
- **Advanced File Upload System** for document management with validation
- **Email Notifications** for registration and edit requests via Gmail SMTP
- **Admin Panel** for profile management, approvals, and bulk operations
- **Swagger/OpenAPI Documentation** for easy API integration
- **Vercel Deployment Ready** with optimized configurations

---

## 🎯 Core Features

### 1. Faculty Profile Management
- Complete faculty profiles with personal and professional information
- Document upload and management (certificates, degrees, publications)
- Profile locking/unlocking system for data integrity
- Edit request workflow for controlled updates

### 2. Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Staff/Manager)
- Session management with token refresh
- Password-protected admin functions

### 3. Document Management
- Secure file upload with validation
- Support for multiple document types (PDF, images, documents)
- File size and type restrictions
- Organized file storage with unique naming

### 4. Admin Controls
- Bulk profile management operations
- Edit request approval system
- Profile locking/unlocking controls
- User management and role assignment

### 5. Modern UI/UX
- Responsive design for all devices
- Intuitive navigation and user experience
- Real-time notifications and feedback

---

## 🧱 Tech Stack

### Backend
- **Spring Boot 3.2.0** - Main framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **PostgreSQL** - Primary database
- **JWT** - Token-based authentication
- **Spring Mail** - Email notifications
- **Swagger/OpenAPI** - API documentation
- **Maven** - Dependency management

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **React Toastify** - Notifications

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Maven** - Build tool
- **NPM** - Package management

---

## 🗂️ Project Structure

```
FacultyProfile/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/ssn/faculty/
│   │   ├── entity/                   # JPA Entities (FacultyProfile, User, Role)
│   │   ├── repository/               # Data Access Layer (JPA Repositories)
│   │   ├── service/                  # Business Logic (Profile, User, Email, File Services)
│   │   ├── controller/               # REST Controllers (Auth, Profile, File APIs)
│   │   ├── security/                 # Security (JWT, Auth Filters, User Details)
│   │   ├── config/                   # Configuration (Security, OpenAPI, Data Init)
│   │   ├── dto/                      # Data Transfer Objects (Profile, Login DTOs)
│   │   └── exception/                # Global Exception Handling
│   ├── src/main/resources/
│   │   ├── application.yml           # Main Configuration
│   │   ├── application-vercel.yml    # Vercel Deployment Config
│   │   ├── application-local.yml     # Local Development Config
│   │   ├── application-prod.yml      # Production Config
│   │   └── application-docker.yml    # Docker Configuration
│   ├── target/                       # Maven Build Output
│   ├── uploads/                      # File Upload Directory
│   ├── logs/                         # Application Logs
│   ├── pom.xml                       # Maven Dependencies
│   ├── build.sh                      # Build Script
│   └── vercel.json                   # Vercel Backend Config
│
├── frontend/                         # React Frontend
│   ├── public/                       # Static Assets
│   │   ├── index.html                # Main HTML Template
│   │   └── manifest.json             # PWA Manifest
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   │   ├── Navbar.js             # Navigation Component
│   │   │   └── ProtectedRoute.js     # Route Protection
│   │   ├── pages/                    # Page Components
│   │   │   ├── Home.js               # Landing Page
│   │   │   ├── Login.js              # Authentication
│   │   │   ├── ProfileList.js        # Faculty Directory
│   │   │   ├── ProfileDetail.js      # Individual Profile View
│   │   │   ├── ProfileEdit.js        # Profile Editor
│   │   │   └── AdminPanel.js         # Admin Dashboard
│   │   ├── contexts/                 # React Contexts
│   │   │   ├── AuthContext.js        # Authentication State
│   │   │   └── ThemeContext.js       # Theme Management
│   │   ├── services/                 # API Services
│   │   │   └── api.js                # Axios API Client
│   │   ├── App.js                    # Main App Component
│   │   ├── App.css                   # Global Styles
│   │   ├── index.js                  # App Entry Point
│   │   └── index.css                 # Base Styles
│   ├── build/                        # Production Build
│   ├── node_modules/                 # NPM Dependencies
│   ├── package.json                  # NPM Dependencies & Scripts
│   └── package-lock.json             # Dependency Lock File
│
├── .gitignore                        # Git Ignore Rules
├── README.md                         # Project Documentation
├── DEPLOYMENT.md                     # Deployment Guide
├── test-app.sh                       # Testing Script
└── vercel.json                       # Vercel Frontend Config
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites

Make sure you have the following installed:
- [Java 17+](https://adoptium.net/) - Required for Spring Boot backend
- [Node.js 18+](https://nodejs.org/) - Required for React frontend
- [Maven 3.6+](https://maven.apache.org/) - Build tool for Java backend
- [PostgreSQL 15+](https://www.postgresql.org/) - Database server
- [Git](https://git-scm.com/) - Version control

**Optional but recommended:**
- [Vercel CLI](https://vercel.com/cli) - For deployment
- [Postman](https://www.postman.com/) - For API testing

---

## 🚀 Quick Start (Local Development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd FacultyProfile

# Make test script executable
chmod +x test-app.sh
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database and user
sudo -u postgres psql
```

```sql
-- In PostgreSQL shell
CREATE DATABASE faculty_profile_db;
CREATE USER faculty_user WITH PASSWORD 'faculty_pass';
GRANT ALL PRIVILEGES ON DATABASE faculty_profile_db TO faculty_user;
\q
```

**Option B: Docker PostgreSQL (Quick Setup)**
```bash
# Run PostgreSQL in Docker
docker run --name faculty-postgres \
  -e POSTGRES_DB=faculty_profile_db \
  -e POSTGRES_USER=faculty_user \
  -e POSTGRES_PASSWORD=faculty_pass \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run

# Alternative: Build and run JAR
mvn clean package
java -jar target/faculty-profile-management-1.0.0.jar
```

**Backend will be available at:**
- API Base URL: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/api/actuator/health

### 4. Frontend Setup & Run

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend will be available at:**
- Application: http://localhost:3000
- API Proxy: Configured to proxy to http://localhost:8080/api

### 5. Test the Application

```bash
# Run the test script (from project root)
./test-app.sh
```

---

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_USERNAME=faculty_user
DB_PASSWORD=faculty_pass
DATABASE_URL=jdbc:postgresql://localhost:5432/faculty_profile_db

# JWT Configuration
JWT_SECRET=your-very-secure-secret-key-1234567890-ssn-faculty-system

# Email Configuration (Gmail SMTP)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
UPLOAD_DIR=./uploads
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api

# Optional: Enable debug mode
REACT_APP_DEBUG=true
```

---

## 🏃‍♂️ Running Commands Reference

### Backend Commands

```bash
# Development
cd backend
mvn spring-boot:run

# Build
mvn clean package

# Run JAR
java -jar target/faculty-profile-management-1.0.0.jar

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Run tests
mvn test

# Clean build
mvn clean install -DskipTests
```

### Frontend Commands

```bash
# Development
cd frontend
npm start

# Build for production
npm run build

# Run tests
npm test

# Install dependencies
npm install

# Build for Vercel
npm run vercel-build
```

### Database Commands

```bash
# Connect to PostgreSQL
psql -h localhost -U faculty_user -d faculty_profile_db

# Backup database
pg_dump -h localhost -U faculty_user faculty_profile_db > backup.sql

# Restore database
psql -h localhost -U faculty_user faculty_profile_db < backup.sql
```

---

## 🔐 Default Credentials

### Manager Account
- **Email:** admin@ssn.edu.in
- **Password:** admin123

### Staff Account
- **Email:** mike.lee@ssn.edu.in
- **Password:** mike789

---

## 📚 API Documentation

The API documentation is available via Swagger UI:
- **URL:** http://localhost:8080/swagger-ui.html
- **OpenAPI Spec:** http://localhost:8080/v3/api-docs

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Profiles
- `GET /api/profiles` - Get all profiles (public)
- `GET /api/profiles/{id}` - Get profile by ID
- `POST /api/profiles` - Create profile (Manager only)
- `PUT /api/profiles/{id}` - Update profile
- `DELETE /api/profiles/{id}` - Delete profile

#### Admin Operations
- `POST /api/profiles/lock-all` - Lock/unlock all profiles
- `POST /api/profiles/{id}/lock` - Lock/unlock specific profile
- `POST /api/profiles/{id}/request-edit` - Request edit access
- `POST /api/profiles/{id}/approve-edit` - Approve edit request

---

## 🎨 Features in Detail

### Profile Management
- **Comprehensive Profiles:** Name, department, qualifications, experience, research interests
- **Document Storage:** Upload and manage certificates, degrees, publications
- **Profile Locking:** Prevent unauthorized edits with time-based locks
- **Edit Requests:** Staff can request edit access for locked profiles

### Security Features
- **JWT Authentication:** Secure token-based authentication
- **Role-Based Access:** Different permissions for Staff and Manager roles
- **File Validation:** Secure file upload with type and size restrictions
- **CORS Configuration:** Proper cross-origin resource sharing setup

### User Experience
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Theme Support:** Dark and light theme options
- **Real-time Updates:** Live data updates without page refresh
- **Intuitive Navigation:** Easy-to-use interface with clear navigation

---

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

This project is optimized for Vercel deployment with separate backend and frontend deployments.

#### Prerequisites
- Vercel account
- PostgreSQL database (Supabase, Railway, or Neon)
- GitHub repository

#### Backend Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DB_USERNAME`: Database username
   - `DB_PASSWORD`: Database password
   - `JWT_SECRET`: Strong secret key
   - `EMAIL_USERNAME`: Gmail address
   - `EMAIL_PASSWORD`: Gmail app password
   - `CORS_ORIGINS`: Your frontend domain

#### Frontend Deployment to Vercel

1. **Update API URL in package.json**
   ```json
   "vercel-build": "REACT_APP_API_URL=https://your-backend-domain.vercel.app/api react-scripts build"
   ```

2. **Deploy via Vercel Dashboard:**
   - Connect GitHub repository
   - Set build command: `npm run vercel-build`
   - Set output directory: `build`
   - Deploy

### Option 2: Traditional Server Deployment

#### Backend Deployment

1. **Build the application**
   ```bash
   cd backend
   mvn clean package -Pprod
   ```

2. **Set environment variables**
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   export DB_USERNAME=your_db_username
   export DB_PASSWORD=your_db_password
   export JWT_SECRET=your_secure_jwt_secret
   export EMAIL_USERNAME=your_email
   export EMAIL_PASSWORD=your_app_password
   export CORS_ORIGINS=https://your-domain.com
   ```

3. **Run the application**
   ```bash
   java -jar target/faculty-profile-management-1.0.0.jar
   ```

#### Frontend Deployment

1. **Build for production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve with any static server**
   ```bash
   # Using serve
   npx serve -s build -l 3000
   
   # Using nginx
   # Copy build folder to nginx html directory
   sudo cp -r build/* /var/www/html/
   ```

### Option 3: Docker Deployment

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: faculty_profile_db
         POSTGRES_USER: faculty_user
         POSTGRES_PASSWORD: faculty_pass
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
     backend:
       build: ./backend
       ports:
         - "8080:8080"
       environment:
         - SPRING_PROFILES_ACTIVE=docker
         - DB_USERNAME=faculty_user
         - DB_PASSWORD=faculty_pass
         - DATABASE_URL=jdbc:postgresql://postgres:5432/faculty_profile_db
       depends_on:
         - postgres
   
     frontend:
       build: ./frontend
       ports:
         - "3000:80"
       environment:
         - REACT_APP_API_URL=http://localhost:8080/api
   
   volumes:
     postgres_data:
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Database Setup for Production

#### Option A: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Use connection string in environment variables

#### Option B: Railway
1. Create account at [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Get connection details from database service
4. Configure environment variables

#### Option C: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create database
3. Get connection string
4. Configure environment variables

---

## 🔧 Configuration

### Backend Configuration

Key configuration options in `application.yml`:

```yaml
# Database
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faculty_profile_db
    username: ${DB_USERNAME:faculty_user}
    password: ${DB_PASSWORD:faculty_pass}

# JWT
jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: 86400000

# File Upload
file:
  upload-dir: ${UPLOAD_DIR:./uploads}
  max-file-size: 10MB
```

### Frontend Configuration

Environment variables in `.env`:

```bash
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Testing
```bash
# Test the complete application
./test-app.sh

# Manual testing endpoints
curl http://localhost:8080/api/actuator/health
curl http://localhost:8080/api/profiles
```

### API Testing with Postman
1. Import the API collection (if available)
2. Set base URL to `http://localhost:8080/api`
3. Test authentication endpoints first
4. Test profile CRUD operations

---

## 📈 Monitoring & Logs

### Application Logs
- **Backend:** `backend/logs/server.log`
- **Console:** Check terminal output during development
- **Vercel:** Check function logs in Vercel dashboard

### Health Checks
- **Backend Health:** http://localhost:8080/api/actuator/health
- **Database Status:** Check PostgreSQL connection
- **API Status:** http://localhost:8080/api/profiles

### Performance Monitoring
- **Backend Metrics:** http://localhost:8080/api/actuator/metrics
- **Database Queries:** Enable SQL logging in development
- **Frontend Performance:** Use browser dev tools

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Backend Won't Start
```bash
# Check Java version
java -version

# Check Maven installation
mvn -version

# Clean and rebuild
cd backend
mvn clean install
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U faculty_user -d faculty_profile_db

# Check if database exists
sudo -u postgres psql -l
```

#### 3. Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node -v
```

#### 4. CORS Issues
- Verify `CORS_ORIGINS` environment variable
- Check if frontend URL is included in allowed origins
- Ensure backend is running on correct port

#### 5. File Upload Issues
- Check file size limits (max 10MB)
- Verify file types are allowed
- Check upload directory permissions
- Ensure multipart configuration is correct

#### 6. Authentication Issues
- Verify JWT secret is set
- Check token expiration time
- Ensure proper role assignments
- Clear browser localStorage if needed

### Debug Mode

#### Backend Debug
```bash
# Enable debug logging
export LOGGING_LEVEL_COM_SSN=DEBUG
mvn spring-boot:run
```

#### Frontend Debug
```bash
# Enable React debug mode
export REACT_APP_DEBUG=true
npm start
```

### Log Analysis
```bash
# View backend logs
tail -f backend/logs/server.log

# View specific error patterns
grep -i error backend/logs/server.log

# Monitor real-time logs
journalctl -f -u your-service-name
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and FAQ

---

## 🔮 Future Enhancements

- [ ] Advanced search and filtering
- [ ] PDF generation for profiles
- [ ] Integration with external systems (ORCID, Google Scholar)
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Advanced file management
- [ ] Real-time notifications
- [ ] Advanced admin dashboard
- [ ] API rate limiting and monitoring

---

## 🎯 Quick Start Summary

For immediate setup, follow these essential steps:

```bash
# 1. Clone and setup
git clone <repository-url>
cd FacultyProfile
chmod +x test-app.sh

# 2. Setup database (choose one)
# Option A: Docker PostgreSQL
docker run --name faculty-postgres \
  -e POSTGRES_DB=faculty_profile_db \
  -e POSTGRES_USER=faculty_user \
  -e POSTGRES_PASSWORD=faculty_pass \
  -p 5432:5432 -d postgres:15

# Option B: Local PostgreSQL
sudo -u postgres psql
CREATE DATABASE faculty_profile_db;
CREATE USER faculty_user WITH PASSWORD 'faculty_pass';
GRANT ALL PRIVILEGES ON DATABASE faculty_profile_db TO faculty_user;
\q

# 3. Start backend
cd backend
mvn spring-boot:run

# 4. Start frontend (new terminal)
cd frontend
npm install
npm start

# 5. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/swagger-ui.html
```

## 📞 Support & Contact

- **Documentation:** Check this README and DEPLOYMENT.md
- **Issues:** Create GitHub issues for bugs or feature requests
- **Email:** Contact the development team
- **Institution:** SSN College of Engineering

---

**Built with ❤️ for SSN College of Engineering**

*This project demonstrates modern full-stack development practices with Spring Boot, React, and PostgreSQL, providing a robust solution for academic faculty management.*