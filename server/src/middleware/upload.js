const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/avatars', 'uploads/jobs', 'uploads/disputes', 'uploads/temp'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/temp';
    
    // Determine upload path based on file type and route
    if (req.route.path.includes('avatar')) {
      uploadPath = 'uploads/avatars';
    } else if (req.route.path.includes('job')) {
      uploadPath = 'uploads/jobs';
    } else if (req.route.path.includes('dispute')) {
      uploadPath = 'uploads/disputes';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    image: /\.(jpg|jpeg|png|gif|webp)$/i,
    document: /\.(pdf|doc|docx|txt|rtf)$/i,
    archive: /\.(zip|rar|7z)$/i,
    video: /\.(mp4|avi|mov|wmv|flv)$/i
  };
  
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // Check if file type is allowed
  const isAllowed = Object.values(allowedTypes).some(regex => regex.test(fileExt));
  
  if (isAllowed) {
    // Additional MIME type validation
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/rtf',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      'video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. MIME type not allowed.'), false);
    }
  } else {
    cb(new Error('Invalid file type. Only images, documents, archives, and videos are allowed.'), false);
  }
};

// Create multer instances for different use cases
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Avatar upload (single file, smaller size limit)
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/avatars',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'avatar-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(jpg|jpeg|png|gif|webp)$/i;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.test(fileExt) && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
    files: 1
  }
});

// Job attachments upload (multiple files)
const jobUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/jobs',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'job-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files per job
  }
});

// Dispute attachments upload
const disputeUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/disputes',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'dispute-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 files per dispute
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum allowed is 5 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

// Utility function to get file info
const getFileInfo = (file) => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
  };
};

module.exports = {
  upload,
  avatarUpload,
  jobUpload,
  disputeUpload,
  handleUploadError,
  deleteFile,
  getFileInfo
};
