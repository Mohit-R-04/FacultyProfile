# Faculty Profile Management System - Deployment Guide

## Overview
This guide will help you deploy the Faculty Profile Management System to Vercel without Docker dependencies.

## Prerequisites
- Node.js 18+ installed
- Java 17+ installed
- Maven 3.6+ installed
- PostgreSQL database (local or cloud)
- Vercel account
- GitHub account

## Project Structure
```
FacultyProfile-main/
├── backend/                 # Spring Boot API
├── frontend/               # React Frontend
├── vercel.json            # Vercel configuration for frontend
└── DEPLOYMENT.md          # This file
```

## Backend Deployment

### 1. Database Setup
You'll need a PostgreSQL database. Options:
- **Local**: Install PostgreSQL locally
- **Cloud**: Use services like:
  - Supabase (free tier available)
  - Railway
  - Heroku Postgres
  - AWS RDS

### 2. Environment Variables
Create a `.env` file in the backend directory with:
```env
DATABASE_URL=jdbc:postgresql://your-db-host:5432/faculty_profile_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your-very-secure-secret-key-1234567890-ssn-faculty-system
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 3. Build Backend
```bash
cd backend
chmod +x build.sh
./build.sh
```

### 4. Deploy Backend to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### 5. Configure Vercel Environment Variables
In Vercel dashboard, add these environment variables:
- `DATABASE_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`
- `CORS_ORIGINS`

## Frontend Deployment

### 1. Update API URL
Update the `REACT_APP_API_URL` in `frontend/package.json`:
```json
"vercel-build": "REACT_APP_API_URL=https://your-backend-domain.vercel.app/api react-scripts build"
```

### 2. Deploy Frontend
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run vercel-build`
3. Set output directory: `build`
4. Deploy

## Local Development

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will run on http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend will run on http://localhost:3000

## Features Fixed

### ✅ Profile Picture Upload
- Fixed file mapping in backend service
- Updated frontend to send files with descriptive names
- Proper handling of multiple file types

### ✅ CORS Configuration
- Updated CORS to allow Vercel domains
- Added production CORS settings

### ✅ API Integration
- Fixed multipart form data handling
- Updated frontend API calls to match backend changes
- Proper file upload mapping

### ✅ Docker Removal
- Removed all Docker-related files
- Updated configurations for direct deployment

## Troubleshooting

### Common Issues

1. **"This site can't be reached"**
   - Check if backend is running
   - Verify CORS configuration
   - Check API URL in frontend

2. **Profile picture not uploading**
   - Check file size (max 10MB)
   - Verify file type (jpg, jpeg, png, pdf, doc, docx)
   - Check backend logs for errors

3. **Database connection issues**
   - Verify database credentials
   - Check if database is accessible
   - Ensure database exists

### Logs
- Backend logs: Check Vercel function logs
- Frontend logs: Check browser console
- Database logs: Check your database provider

## Security Notes

1. **JWT Secret**: Use a strong, unique secret
2. **Database**: Use strong passwords
3. **CORS**: Only allow necessary origins
4. **File Uploads**: Validate file types and sizes

## Support

If you encounter issues:
1. Check the logs
2. Verify environment variables
3. Test locally first
4. Check Vercel deployment logs

## Next Steps

1. Set up your database
2. Deploy backend to Vercel
3. Update frontend API URL
4. Deploy frontend to Vercel
5. Test all functionality
6. Configure custom domain (optional)
