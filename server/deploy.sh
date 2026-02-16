#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Define colors for better readability
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

# Function to check if a package is installed
is_package_installed() {
  npm list --depth=0 | grep -q "$1@"
  return $?
}

print_status "Starting CauseConnect server deployment process..."

# Check for environment file
if [ ! -f ".env" ]; then
  print_warning "No .env file found. Creating a sample .env file..."
  cat > .env << EOL
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/causeconnect

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Email Configuration (if applicable)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOL
  print_status "Sample .env file created. Please update with your actual values."
fi

# Install dependencies
print_status "Installing dependencies..."
# Using npm install directly instead of npm ci to avoid lock file sync issues
npm install

# Check for TypeScript
if ! command -v tsc &> /dev/null; then
  print_warning "TypeScript compiler not found, installing..."
  npm install typescript --save-dev
fi

# Ensure required dependencies are installed
for pkg in "typescript" "ts-node" "helmet" "express" "mongoose"; do
  if ! is_package_installed "$pkg"; then
    print_warning "$pkg not found in package.json, installing..."
    npm install "$pkg" --save
  fi
done

# Clean and create dist directory
print_status "Preparing build directory..."
rm -rf dist
mkdir -p dist

# Compile TypeScript
print_status "Compiling TypeScript..."
npx tsc || {
  print_error "TypeScript compilation failed!"
  print_status "Checking tsconfig.json..."
  
  # Check if tsconfig.json exists, create if not
  if [ ! -f "tsconfig.json" ]; then
    print_warning "tsconfig.json not found. Creating default configuration..."
    cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOL
    print_status "Default tsconfig.json created. Attempting compilation again..."
    npx tsc || {
      print_error "TypeScript compilation failed again. Please check your TypeScript code for errors."
      exit 1
    }
  else
    print_error "tsconfig.json exists but compilation failed. Please check your TypeScript code for errors."
    exit 1
  fi
}

# Verify build
if [ ! -f "dist/index.js" ]; then
  print_error "Build verification failed: dist/index.js not found."
  exit 1
fi

# Copy non-TypeScript files if needed
print_status "Copying additional assets..."
if [ -d "src/public" ]; then
  mkdir -p dist/public
  cp -r src/public/* dist/public/
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

print_status "Build completed successfully!"
print_status "To start the server, run: node dist/index.js"
print_status "For development, run: npm run dev"

# Optional: Start the server
if [ "$1" = "--start" ]; then
  print_status "Starting server..."
  node dist/index.js
fi
