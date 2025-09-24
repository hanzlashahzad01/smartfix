const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { authenticateToken, requireAdminOrSupport } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/jobs
// @desc    Get all jobs with pagination and filtering
// @access  Private (Admin/Support)
router.get('/', requireAdminOrSupport, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      priority = '',
      category = '',
      technician = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { jobId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (technician) filter['technician.id'] = technician;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get jobs
    const jobs = await Job.find(filter)
      .populate('technician.id', 'displayName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalJobs: total,
          hasNext: skip + jobs.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private (Admin/Support)
router.get('/:id', requireAdminOrSupport, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('technician.id', 'displayName email phoneNumber')
      .populate('timeline.updatedBy', 'displayName email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Admin/Support)
router.post('/', requireAdminOrSupport, async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'medium',
      category,
      customer,
      estimatedCost,
      scheduledDate,
      tags = [],
      isUrgent = false
    } = req.body;

    // Validation
    if (!title || !description || !category || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and customer information are required'
      });
    }

    // Create new job
    const job = new Job({
      title,
      description,
      priority,
      category,
      customer,
      estimatedCost,
      scheduledDate,
      tags,
      isUrgent
    });

    // Add initial timeline entry
    await job.addTimelineEntry('created', 'Job created', req.user._id);

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// @route   PUT /api/jobs/:id/status
// @desc    Update job status
// @access  Private (Admin/Support)
router.put('/:id/status', requireAdminOrSupport, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.updateStatus(status, notes || `Status changed to ${status}`, req.user._id);

    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: { job }
    });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
});

// @route   GET /api/jobs/stats/overview
// @desc    Get job statistics
// @access  Private (Admin/Support)
router.get('/stats/overview', requireAdminOrSupport, async (req, res) => {
  try {
    const stats = await Job.getJobStats();
    
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'in_progress' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const urgentJobs = await Job.countDocuments({ isUrgent: true });
    
    const jobsThisMonth = await Job.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        completedJobs,
        urgentJobs,
        jobsThisMonth,
        statusBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job statistics',
      error: error.message
    });
  }
});

module.exports = router;