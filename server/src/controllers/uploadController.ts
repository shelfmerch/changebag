import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';

// Function to copy uploaded file to public directory
const copyToPublic = (filename: string): string => {
  const sourcePath = path.join(__dirname, '../../uploads', filename);
  const publicUploadsDir = path.join(__dirname, '../../../public/uploads');
  const destPath = path.join(publicUploadsDir, filename);
  
  // Create public uploads directory if it doesn't exist
  if (!fs.existsSync(publicUploadsDir)) {
    console.log(`Creating public uploads directory: ${publicUploadsDir}`);
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${filename} to public uploads directory`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error(`Error copying ${filename} to public directory: ${err}`);
    return `/uploads/${filename}`; // Return the path anyway
  }
};

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating uploads directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log(`Uploads directory exists: ${uploadDir}`);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Create multer upload instance
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (increased from 5MB)
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Compress image middleware for logo uploads
export const compressLogo = async (req: Request, res: Response, next: Function) => {
  if (!req.file) {
    return next();
  }

  try {
    console.log(`Compressing logo: ${req.file.path}`);
    
    // Get file extension to determine output format
    const ext = path.extname(req.file.path).toLowerCase();
    let format: keyof sharp.FormatEnum = 'jpeg'; // Default format
    let quality = 80; // Default quality
    
    // Determine format based on extension
    if (ext === '.png') {
      format = 'png';
      quality = 80;
    } else if (ext === '.webp') {
      format = 'webp';
      quality = 80;
    } else if (ext === '.jpg' || ext === '.jpeg') {
      format = 'jpeg';
      quality = 80;
    }
    
    // Get image dimensions
    const metadata = await sharp(req.file.path).metadata();
    
    // Resize if image is too large (keep aspect ratio)
    let sharpInstance = sharp(req.file.path);
    const MAX_WIDTH = 800; // Smaller max width for logos
    
    if (metadata.width && metadata.width > MAX_WIDTH) {
      console.log(`Resizing logo from ${metadata.width}x${metadata.height} to max width ${MAX_WIDTH}`);
      sharpInstance = sharpInstance.resize({
        width: MAX_WIDTH,
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Compress and save
    const compressedImageBuffer = await sharpInstance[format]({
      quality: quality,
      progressive: true,
      optimizeScans: true
    }).toBuffer();
    
    // Calculate compression ratio
    const originalSize = req.file.size;
    const compressedSize = compressedImageBuffer.length;
    const compressionRatio = (1 - (compressedSize / originalSize)) * 100;
    
    console.log(`Logo compressed: ${originalSize} bytes → ${compressedSize} bytes (${compressionRatio.toFixed(2)}% reduction)`);
    
    // Write the compressed image back to the same file
    fs.writeFileSync(req.file.path, compressedImageBuffer);
    
    // Update file size in req.file
    req.file.size = compressedImageBuffer.length;
    
    next();
  } catch (error) {
    console.error('Error compressing logo:', error);
    // Continue even if compression fails
    next();
  }
};

// Handle logo upload
export const uploadLogo = (req: Request, res: Response): void => {
  try {
    console.log('Upload request received:', req.file ? 'File included' : 'No file');
    
    if (!req.file) {
      console.log('No file in request');
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    console.log('File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Generate URL for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Generated file URL:', fileUrl);
    
    // Check if the file exists in the uploads directory
    const filePath = path.join(__dirname, '../../uploads', req.file.filename);
    const fileExists = fs.existsSync(filePath);
    console.log(`File exists at ${filePath}: ${fileExists}`);
    
    // Copy the file to the public directory for frontend access
    const publicUrl = copyToPublic(req.file.filename);
    console.log('Copied to public directory, accessible at:', publicUrl);
    
    res.status(200).json({ 
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};
