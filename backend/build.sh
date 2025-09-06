#!/bin/bash

# Build script for Faculty Profile Management Backend
echo "Building Faculty Profile Management Backend..."

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package the application
mvn package -DskipTests

echo "Build completed successfully!"
echo "JAR file location: target/faculty-profile-management-1.0.0.jar"
