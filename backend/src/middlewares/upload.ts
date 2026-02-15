import multer from 'multer';
import { Request } from 'express';

// Configure multer for memory storage (we'll upload to Cloudinary from memory)
const storage = multer.memoryStorage();

// File filter to only accept images
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileFilter = (_req: Request, file: any, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Single image upload
export const uploadSingle = upload.single('image');

// Multiple images upload (up to 5)
export const uploadMultiple = upload.array('images', 5);
