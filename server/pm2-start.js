/**
 * PM2 Startup Script for CauseConnect Server
 * 
 * This script is designed to be used with PM2 to start the server
 * in a production environment, bypassing TypeScript compilation issues.
 */

console.log('Starting CauseConnect server with PM2...');

// Check if running in compiled mode or ts-node mode
const fs = require('fs');
const path = require('path');

// Path to the compiled JavaScript file
const compiledPath = path.join(__dirname, 'dist', 'index.js');

if (fs.existsSync(compiledPath)) {
  console.log('Found compiled JavaScript. Starting from dist/index.js');
  // Start the compiled JavaScript version
  require('./dist/index.js');
} else {
  console.log('Compiled JavaScript not found. Using ts-node to run TypeScript directly');
  // Use ts-node to run the TypeScript version
  try {
    // First, ensure all dependencies are properly installed
    console.log('Checking for helmet package...');
    try {
      require('helmet');
      console.log('Helmet package found!');
    } catch (err) {
      console.error('Helmet package not found. Installing...');
      const { execSync } = require('child_process');
      execSync('npm install helmet --save', { stdio: 'inherit' });
      console.log('Helmet installed successfully!');
    }

    // Register ts-node
    require('ts-node/register');
    
    // Run the TypeScript file
    require('./src/index.ts');
  } catch (err) {
    console.error('Failed to start server with ts-node:', err);
    process.exit(1);
  }
}
