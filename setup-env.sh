#!/bin/bash

# Script to set up environment variables for the CauseConnect frontend

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

# Get the server's IP address or use localhost as fallback
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
print_status "Detected server IP: ${SERVER_IP}"

# Create .env file for development
print_section "Setting up development environment"
print_status "Creating .env file for development..."
cat > .env << EOL
# API URL pointing to local development server
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development

# Application Title
VITE_APP_TITLE=CauseConnect - Dev
EOL

# Create .env.production file
print_section "Setting up production environment"
print_status "Creating .env.production file with server IP..."
cat > .env.production << EOL
# API URL pointing to this server's IP
VITE_API_URL=http://${SERVER_IP}:5000/api

# Environment
VITE_NODE_ENV=production

# Application Title
VITE_APP_TITLE=CauseConnect
EOL

print_status "Environment files created successfully!"
print_section "Next Steps"
print_status "For development:"
print_status "  npm run dev"
print_status "For production build:"
print_status "  npm run build"
print_status "  npm run preview -- --host --port 8086"
