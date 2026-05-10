/**
 * CLOUDINARY INTEGRATION
 * =====================
 * This module configures multer to upload files to Cloudinary CDN instead of local storage.
 * 
 * WHY CLOUDINARY?
 * - No server disk space needed
 * - Automatic image optimization and responsive delivery
 * - Global CDN for fast image loading
 * - Automatic backup and redundancy
 * - Easy integration with image transformations
 * - Scalable for production use
 * 
 * Setup:
 * 1. Sign up at https://cloudinary.com/
 * 2. Get your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from dashboard
 * 3. Add to .env and .env.example
 */

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resolvex/complaints', // Organize images in a folder
    resource_type: 'auto',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(file.originalname.split('.').pop().toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
