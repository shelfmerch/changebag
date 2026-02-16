import path from 'path';
import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';

// Configure static file serving
const configureStaticFiles = (app: any) => {
  // Serve uploaded files from the uploads directory
  const uploadsPath = path.join(__dirname, '../../uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsPath)) {
    console.log(`Creating uploads directory: ${uploadsPath}`);
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Use express.static for better performance and caching with CORS headers
  app.use('/uploads', (req: any, res: any, next: NextFunction) => {
    // Add CORS headers specifically for image files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, (express as any).static(uploadsPath));
  
  // Add a fallback middleware to handle errors and logging
  app.use('/uploads', (req: any, res: any, next: any) => {
    const requestedPath = req.path;
    const fullPath = path.join(uploadsPath, requestedPath);
    
    console.log(`File not found: ${fullPath}`);
    console.log(`Available files in uploads directory:`);
    
    try {
      const files = fs.readdirSync(uploadsPath);
      console.log(files);
    } catch (error) {
      console.error(`Error reading uploads directory: ${error}`);
    }
    
    // Send a 404 response with helpful information
    res.status(404).json({
      error: 'File not found',
      requestedPath: requestedPath
    });
  });
  
  console.log(`Static files configured: serving uploads from ${uploadsPath}`);
};

export default configureStaticFiles;
