import multer from 'multer';

// Validates and stores avatar uploads in memory.
const storage = multer.memoryStorage(); // Store files in memory for processing
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  // Rejects non-image files before they are stored.
  fileFilter: (_req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export default upload;