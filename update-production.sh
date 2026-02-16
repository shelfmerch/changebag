#!/bin/bash

# Set colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print errors
print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Navigate to project directory
print_status "Navigating to project directory..."
cd /path/to/your/project || { print_error "Failed to navigate to project directory"; exit 1; }

# Pull latest changes
print_status "Pulling latest changes from GitHub..."
git pull origin master || { print_error "Failed to pull changes"; exit 1; }

# Install dependencies
print_status "Installing dependencies..."
npm install || { print_error "Failed to install dependencies"; exit 1; }

# Build frontend
print_status "Building frontend..."
npm run build || { print_error "Failed to build frontend"; exit 1; }

# Copy built files to web server directory
print_status "Copying built files to web server directory..."
sudo cp -r dist/* /var/www/html/ || { print_error "Failed to copy files"; exit 1; }

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Test nginx configuration
print_status "Testing nginx configuration..."
sudo nginx -t || { print_error "Nginx configuration test failed"; exit 1; }

# Restart nginx
print_status "Restarting nginx..."
sudo systemctl restart nginx || { print_error "Failed to restart nginx"; exit 1; }

print_status "Deployment completed successfully!" 