import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (increased from 5MB)
  }
});

// Image compression middleware to be used after multer
export const compressImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  try {
    console.log(`Compressing image: ${req.file.path}`);
    
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
    const MAX_WIDTH = 1200;
    
    if (metadata.width && metadata.width > MAX_WIDTH) {
      console.log(`Resizing image from ${metadata.width}x${metadata.height} to max width ${MAX_WIDTH}`);
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
    
    console.log(`Image compressed: ${originalSize} bytes → ${compressedSize} bytes (${compressionRatio.toFixed(2)}% reduction)`);
    
    // Write the compressed image back to the same file
    fs.writeFileSync(req.file.path, compressedImageBuffer);
    
    // Update file size in req.file
    req.file.size = compressedImageBuffer.length;
    
    next();
  } catch (error) {
    console.error('Error compressing image:', error);
    // Continue even if compression fails
    next();
  }
};

export default upload;
