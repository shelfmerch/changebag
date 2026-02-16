#!/bin/bash

echo "Setting up server environment..."

# Pull the latest changes
echo "Pulling latest changes from Git..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install

# Make sure TypeScript is installed
echo "Installing TypeScript globally..."
npm install -g typescript

# Create dist directory if it doesn't exist
echo "Creating dist directory..."
mkdir -p dist

# Create a simple JavaScript entry point that uses ts-node
echo "Creating fallback entry point..."
cat > dist/index.js << 'EOL'
// This is a fallback entry point that uses ts-node to run the TypeScript source
try {
  console.log('Using ts-node to run TypeScript source...');
  require('ts-node/register');
  require('../src/index.ts');
} catch (error) {
  console.error('Failed to run with ts-node:', error);
  process.exit(1);
}
EOL

echo "Setup complete! You can now run 'npm start' to start the server."
