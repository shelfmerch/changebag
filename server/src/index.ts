import dotenv from 'dotenv';
import connectToDatabase from './lib/mongodb';
import app from './app';
import path from 'path';
import fs from 'fs';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

// Check if the env file exists, otherwise use default .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment from ${envFile}`);
} else {
  dotenv.config();
  console.log('Loaded environment from default .env file');
}

// Set port and host from environment variables or use defaults
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Use 0.0.0.0 to listen on all network interfaces

// Log startup information
console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`CORS allowed origins: ${process.env.ALLOWED_ORIGINS || 'All origins (development mode)'}`);

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server after successful database connection
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`API base URL: ${process.env.BASE_URL || `http://${HOST}:${PORT}`}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Export the app for testing purposes
export default app;
