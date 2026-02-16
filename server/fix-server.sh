#!/bin/bash

# Set colors for better readability
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
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

print_status "Starting CauseConnect server fix process..."

# Check for running processes
print_status "Checking for running processes on port 5000..."
PORT_PROCESSES=$(lsof -i :5000 -t)

if [ -n "$PORT_PROCESSES" ]; then
  print_warning "Found processes running on port 5000: $PORT_PROCESSES"
  print_status "Stopping all processes on port 5000..."
  for PID in $PORT_PROCESSES; do
    print_status "Stopping process $PID..."
    kill -15 $PID
  done
  sleep 2
  
  # Check if processes are still running
  REMAINING=$(lsof -i :5000 -t)
  if [ -n "$REMAINING" ]; then
    print_warning "Some processes are still running. Forcing termination..."
    for PID in $REMAINING; do
      print_status "Force stopping process $PID..."
      kill -9 $PID
    done
  fi
else
  print_status "No processes found running on port 5000."
fi

# Check for emergency server file
if [ -f "emergency-server.js" ]; then
  print_warning "Found emergency-server.js file. Removing..."
  rm emergency-server.js
  print_status "Emergency server file removed."
fi

# Stop all PM2 processes
print_status "Stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# Clean up node_modules and reinstall
print_status "Do you want to clean up node_modules and reinstall? (y/n)"
read -r CLEAN_UP

if [ "$CLEAN_UP" = "y" ]; then
  print_status "Cleaning up node_modules..."
  rm -rf node_modules
  print_status "Reinstalling dependencies..."
  npm install
fi

# Rebuild TypeScript
print_status "Building TypeScript..."
npm run build

# Start with new PM2 configuration
print_status "Starting server with new PM2 configuration..."
pm2 start ecosystem.config.js

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

print_status "Fix process completed. Checking server status..."
sleep 2
curl http://localhost:5000

print_status "You can check the server logs with: pm2 logs causeconnect-server"
