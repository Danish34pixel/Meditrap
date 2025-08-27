const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';

    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Only image files are allowed', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Public (allow uploads during onboarding)
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // If Cloudinary is configured, upload to Cloudinary and remove local file
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let resultUrl = `/uploads/${req.file.filename}`;
    let publicId = null;

    if (cloudName && apiKey && apiSecret) {
      try {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'medtek',
        });

        resultUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;

        // delete local file
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.warn('Failed to delete local upload file:', e.message);
        }
      } catch (cloudErr) {
        console.error(
          'Cloudinary upload failed, falling back to local file:',
          cloudErr.message,
        );
        // keep local URL as fallback
      }
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: resultUrl,
        public_id: publicId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Public
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file',
      });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const uploadedFiles = await Promise.all(
      req.files.map(async file => {
        let resultUrl = `/uploads/${file.filename}`;
        let publicId = null;

        if (cloudName && apiKey && apiSecret) {
          try {
            cloudinary.config({
              cloud_name: cloudName,
              api_key: apiKey,
              api_secret: apiSecret,
            });

            const uploadResult = await cloudinary.uploader.upload(file.path, {
              folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'medtek',
            });

            resultUrl = uploadResult.secure_url;
            publicId = uploadResult.public_id;

            try {
              fs.unlinkSync(file.path);
            } catch (e) {
              console.warn('Failed to delete local upload file:', e.message);
            }
          } catch (cloudErr) {
            console.error(
              'Cloudinary upload failed for a file, using local copy:',
              cloudErr.message,
            );
          }
        }

        return {
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: resultUrl,
          public_id: publicId,
        };
      }),
    );

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      count: uploadedFiles.length,
      data: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message,
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      filename,
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
});

// @desc    Get file info
// @route   GET /api/upload/:filename
// @access  Private
router.get('/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      filename,
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    res.json({
      success: true,
      data: {
        filename: filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting file info',
      error: error.message,
    });
  }
});

// @desc    Get all uploaded files
// @route   GET /api/upload
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';

    // Check if upload directory exists
    if (!fs.existsSync(uploadPath)) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Read directory
    const files = fs.readdirSync(uploadPath);
    const fileList = files.map(filename => {
      const filePath = path.join(uploadPath, filename);
      const stats = fs.statSync(filePath);

      return {
        filename: filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`,
      };
    });

    res.json({
      success: true,
      count: fileList.length,
      data: fileList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading upload directory',
      error: error.message,
    });
  }
});

module.exports = router;
