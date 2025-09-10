#!/bin/bash

# Setup script for uploads directory
echo "Setting up uploads directory..."

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Set proper permissions
chmod 755 uploads

# Create a test file to verify permissions
touch uploads/.test
if [ $? -eq 0 ]; then
    echo "✅ Uploads directory setup successful"
    rm uploads/.test
else
    echo "❌ Failed to create test file in uploads directory"
    echo "Please check directory permissions"
    exit 1
fi

echo "Uploads directory is ready for file uploads"
