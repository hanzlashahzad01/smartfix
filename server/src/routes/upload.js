const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { avatarUpload, jobUpload, disputeUpload, handleUploadError, deleteFile, getFileInfo } = require('../middleware/upload');
const User = require('../models/User');
const Job = require('../models/Job');
const Dispute = require('../models/Dispute');

const router = express.Router();

// Apply authentication to all upload routes
router.use(authenticateToken);

// Upload avatar
router.post('/avatar', avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileInfo = getFileInfo(req.file);
    
    // Update user's avatar in database
    const user = await User.findById(req.user._id);
    if (!user) {
      deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.profile.avatar) {
      const oldAvatarPath = user.profile.avatar.replace('/uploads/', 'uploads/');
      deleteFile(oldAvatarPath);
    }

    // Update user profile
    user.profile.avatar = fileInfo.url;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        file: fileInfo,
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// Upload job attachments
router.post('/job/:jobId', jobUpload.array('attachments', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      // Delete uploaded files
      req.files.forEach(file => deleteFile(file.path));
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user has permission to upload to this job
    const isOwner = job.customer.toString() === req.user._id.toString();
    const isTechnician = job.technician && job.technician.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'support'].includes(req.user.role);

    if (!isOwner && !isTechnician && !isAdmin) {
      req.files.forEach(file => deleteFile(file.path));
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Process uploaded files
    const fileInfos = req.files.map(file => ({
      ...getFileInfo(file),
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    }));

    // Add attachments to job
    if (!job.attachments) {
      job.attachments = [];
    }
    job.attachments.push(...fileInfos);
    await job.save();

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: fileInfos,
        job: job
      }
    });

  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    console.error('Job upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files'
    });
  }
});

// Upload dispute attachments
router.post('/dispute/:disputeId', disputeUpload.array('attachments', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const dispute = await Dispute.findById(req.params.disputeId);
    if (!dispute) {
      req.files.forEach(file => deleteFile(file.path));
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check if user has permission to upload to this dispute
    const isOwner = dispute.customer.toString() === req.user._id.toString();
    const isAssigned = dispute.assignedTo && dispute.assignedTo.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'support'].includes(req.user.role);

    if (!isOwner && !isAssigned && !isAdmin) {
      req.files.forEach(file => deleteFile(file.path));
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Process uploaded files
    const fileInfos = req.files.map(file => ({
      ...getFileInfo(file),
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    }));

    // Add attachments to dispute
    if (!dispute.attachments) {
      dispute.attachments = [];
    }
    dispute.attachments.push(...fileInfos);
    await dispute.save();

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: fileInfos,
        dispute: dispute
      }
    });

  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    console.error('Dispute upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files'
    });
  }
});

// Delete file
router.delete('/file/:type/:id/:filename', async (req, res) => {
  try {
    const { type, id, filename } = req.params;
    
    let document;
    let filePath;

    switch (type) {
      case 'job':
        document = await Job.findById(id);
        filePath = `uploads/jobs/${filename}`;
        break;
      case 'dispute':
        document = await Dispute.findById(id);
        filePath = `uploads/disputes/${filename}`;
        break;
      case 'avatar':
        document = await User.findById(id);
        filePath = `uploads/avatars/${filename}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    // Check permissions
    const isOwner = document.customer?.toString() === req.user._id.toString() || 
                   document._id.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'support'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove file from document
    if (type === 'avatar') {
      document.profile.avatar = null;
    } else if (document.attachments) {
      document.attachments = document.attachments.filter(
        attachment => !attachment.filename.includes(filename)
      );
    }

    await document.save();

    // Delete physical file
    const deleted = deleteFile(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: { deleted }
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Get file info
router.get('/info/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    let document;
    let files = [];

    switch (type) {
      case 'job':
        document = await Job.findById(id).populate('customer technician');
        if (document && document.attachments) {
          files = document.attachments;
        }
        break;
      case 'dispute':
        document = await Dispute.findById(id).populate('customer assignedTo');
        if (document && document.attachments) {
          files = document.attachments;
        }
        break;
      case 'user':
        document = await User.findById(id);
        if (document && document.profile.avatar) {
          files = [{
            filename: document.profile.avatar.split('/').pop(),
            url: document.profile.avatar,
            type: 'avatar'
          }];
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid type'
        });
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    res.json({
      success: true,
      data: {
        files,
        count: files.length
      }
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file info'
    });
  }
});

// Apply error handling middleware
router.use(handleUploadError);

module.exports = router;
