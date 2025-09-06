#!/bin/bash

echo "🧪 Testing Faculty Profile Management System"
echo "============================================="

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.6+"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Test backend build
echo ""
echo "🔨 Testing backend build..."
cd backend
if mvn clean compile -q; then
    echo "✅ Backend compiles successfully"
else
    echo "❌ Backend compilation failed"
    exit 1
fi

# Test frontend build
echo ""
echo "🔨 Testing frontend build..."
cd ../frontend
if npm install --silent && npm run build --silent; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed! The application is ready for deployment."
echo ""
echo "Next steps:"
echo "1. Set up your PostgreSQL database"
echo "2. Configure environment variables"
echo "3. Deploy to Vercel following DEPLOYMENT.md"
echo ""
echo "For local development:"
echo "1. Backend: cd backend && mvn spring-boot:run"
echo "2. Frontend: cd frontend && npm start"
