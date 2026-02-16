import fs from 'fs';
import path from 'path';

/**
 * Copies files from the server uploads directory to the public uploads directory
 * This ensures that uploaded files are accessible to the frontend
 */
export const copyUploadsToPublic = () => {
  const serverUploadsDir = path.join(__dirname, '../../uploads');
  const publicUploadsDir = path.join(__dirname, '../../../public/uploads');
  
  // Create public uploads directory if it doesn't exist
  if (!fs.existsSync(publicUploadsDir)) {
    console.log(`Creating public uploads directory: ${publicUploadsDir}`);
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }
  
  // Read all files from server uploads directory
  try {
    const files = fs.readdirSync(serverUploadsDir);
    console.log(`Found ${files.length} files in server uploads directory`);
    
    // Copy each file to public uploads directory
    let copiedCount = 0;
    for (const file of files) {
      const sourcePath = path.join(serverUploadsDir, file);
      const destPath = path.join(publicUploadsDir, file);
      
      // Skip if file already exists in destination
      if (fs.existsSync(destPath)) {
        continue;
      }
      
      try {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`Copied ${file} to public uploads directory`);
      } catch (err) {
        console.error(`Error copying ${file}: ${err}`);
      }
    }
    
    console.log(`Copied ${copiedCount} new files to public uploads directory`);
  } catch (err) {
    console.error(`Error reading server uploads directory: ${err}`);
  }
};

export default copyUploadsToPublic;
