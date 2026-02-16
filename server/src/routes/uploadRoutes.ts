import { upload, uploadLogo, compressLogo } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';
import { createRouter } from '../utils/routerHelper';
import { compressImage } from '../middleware/fileUpload';

const router = createRouter();

// Upload logo endpoint with compression - public access for sponsors to upload logos
router.post('/logo', upload.single('logo'), compressLogo, uploadLogo);

// Generic image upload endpoint with compression
router.post('/image', authenticateToken, upload.single('image'), compressImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Generate URL for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      message: 'Image uploaded and compressed successfully',
      url: fileUrl,
      originalSize: req.file.size
    });
  } catch (error) {
    console.error('Error in image upload route:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

export default router;
