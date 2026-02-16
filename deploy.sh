#!/bin/bash

# CauseConnect Deployment Script for Hostinger VPS
# This script handles deployment of both frontend and backend components

# Set colors for better readability
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Function to print status messages
print_status() {
  echo -e "${GREEN}==>${NC} $1"
}

# Function to print warnings
print_warning() {
  echo -e "${YELLOW}WARNING:${NC} $1"
}

# Function to print errors
print_error() {
  echo -e "${RED}ERROR:${NC} $1"
}

# Function to print section headers
print_section() {
  echo -e "\n${BLUE}===== $1 =====${NC}"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install npm first."
  exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  print_warning "PM2 is not installed. Installing PM2 globally..."
  npm install -g pm2
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
  print_warning "Nginx is not installed. Please install Nginx manually."
fi

# Project root directory
PROJECT_ROOT=$(pwd)
FRONTEND_DIR="${PROJECT_ROOT}"
BACKEND_DIR="${PROJECT_ROOT}/server"

# Verify required directories exist
if [ ! -d "$BACKEND_DIR" ]; then
  print_error "Backend directory not found at: $BACKEND_DIR"
  exit 1
fi

print_section "Deployment Configuration"

# Get the server's IP address or use provided value
SERVER_IP=${1:-$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")}
print_status "Using server IP: ${SERVER_IP}"

# Ask for domain name if not provided
DOMAIN=${2:-"changebag.org"}
print_status "Using domain: ${DOMAIN}"

# Backend API subdomain
API_SUBDOMAIN=${3:-"api.${DOMAIN}"}
print_status "Using API subdomain: ${API_SUBDOMAIN}"

print_section "Setting up Backend Environment"

# Create backend .env.production file
print_status "Creating backend .env.production file..."
cat > "${BACKEND_DIR}/.env.production" << EOL
# Database connection
MONGODB_URI=${MONGODB_URI:-"your_mongodb_connection_string"}
JWT_SECRET=${JWT_SECRET:-"your_jwt_secret"}

# Email configuration
EMAIL_SERVICE=${EMAIL_SERVICE:-"gmail"}
EMAIL_USER=${EMAIL_USER:-"your_email@gmail.com"}
EMAIL_PASSWORD=${EMAIL_PASSWORD:-"your_app_password"}

# Admin credentials
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@example.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"your_admin_password"}

# Payment gateway (Razorpay)
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID:-"your_razorpay_key_id"}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET:-"your_razorpay_key_secret"}

# Server configuration
PORT=5000
NODE_ENV=production

# CORS configuration
FRONTEND_URL=https://${DOMAIN}
ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN},http://localhost:8083

# Hosting configuration
HOST=0.0.0.0
BASE_URL=https://${API_SUBDOMAIN}
EOL

print_status "Backend environment file created successfully!"

print_section "Setting up Frontend Environment"

# Create frontend .env.production file
print_status "Creating frontend .env.production file..."
cat > "${FRONTEND_DIR}/.env.production" << EOL
# API URL - Points to your production backend API
VITE_API_URL=https://${API_SUBDOMAIN}/api

# Environment
VITE_NODE_ENV=production

# Application Title
VITE_APP_TITLE=CauseConnect

# Base URL for uploads
VITE_UPLOADS_URL=https://${API_SUBDOMAIN}/uploads

# Site URL - Used for absolute URLs
VITE_SITE_URL=https://${DOMAIN}
EOL

print_status "Frontend environment file created successfully!"

print_section "Building Backend"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd "${BACKEND_DIR}"
npm install

# Build backend
print_status "Building backend..."
npm run build

print_section "Building Frontend"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd "${FRONTEND_DIR}"
npm install

# Build frontend
print_status "Building frontend..."
npm run build

print_section "Setting up Nginx Configuration"

# Create Nginx configuration
print_status "Creating Nginx configuration..."
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_CONF_FILE="${DOMAIN}.conf"

# Check if we can write to Nginx directory
if [ -d "$NGINX_CONF_DIR" ] && [ -w "$NGINX_CONF_DIR" ]; then
  cat > "${NGINX_CONF_DIR}/${NGINX_CONF_FILE}" << EOL
# Frontend configuration
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://${DOMAIN}\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL configuration (you'll need to set this up separately)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Frontend static files
    root ${FRONTEND_DIR}/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Serve uploaded files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Backend API configuration
server {
    listen 80;
    server_name ${API_SUBDOMAIN};

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://${API_SUBDOMAIN}\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${API_SUBDOMAIN};

    # SSL configuration (you'll need to set this up separately)
    ssl_certificate /etc/letsencrypt/live/${API_SUBDOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${API_SUBDOMAIN}/privkey.pem;
    
    # Proxy all requests to backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

  print_status "Nginx configuration created at: ${NGINX_CONF_DIR}/${NGINX_CONF_FILE}"
  print_status "You'll need to create a symbolic link to sites-enabled and reload Nginx:"
  print_status "sudo ln -s ${NGINX_CONF_DIR}/${NGINX_CONF_FILE} /etc/nginx/sites-enabled/"
  print_status "sudo nginx -t && sudo systemctl reload nginx"
else
  # Create a local copy of the Nginx configuration
  cat > "${PROJECT_ROOT}/nginx-${DOMAIN}.conf" << EOL
# Frontend configuration
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://${DOMAIN}\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL configuration (you'll need to set this up separately)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Frontend static files
    root ${FRONTEND_DIR}/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Serve uploaded files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Backend API configuration
server {
    listen 80;
    server_name ${API_SUBDOMAIN};

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://${API_SUBDOMAIN}\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${API_SUBDOMAIN};

    # SSL configuration (you'll need to set this up separately)
    ssl_certificate /etc/letsencrypt/live/${API_SUBDOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${API_SUBDOMAIN}/privkey.pem;
    
    # Proxy all requests to backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

  print_warning "Could not write to Nginx configuration directory. A local copy has been created at: ${PROJECT_ROOT}/nginx-${DOMAIN}.conf"
  print_warning "You'll need to manually copy this file to your Nginx configuration directory."
fi

print_section "Setting up PM2 Configuration"

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem file..."
cat > "${BACKEND_DIR}/ecosystem.config.js" << EOL
module.exports = {
  apps: [
    {
      name: 'causeconnect-api',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true
    }
  ]
};
EOL

print_status "PM2 ecosystem file created successfully!"

# Create logs directory for PM2
mkdir -p "${BACKEND_DIR}/logs"

print_section "Starting Application with PM2"

# Start backend with PM2
cd "${BACKEND_DIR}"
print_status "Starting backend with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

print_section "Deployment Complete"

print_status "CauseConnect has been deployed successfully!"
print_status "Frontend: https://${DOMAIN}"
print_status "Backend API: https://${API_SUBDOMAIN}"
print_status "You can monitor the backend with: pm2 monit"
print_status "View backend logs with: pm2 logs causeconnect-api"

print_warning "Don't forget to set up SSL certificates with Let's Encrypt for your domains!"
print_warning "You can use: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} -d ${API_SUBDOMAIN}"
