const express = require('express');
const Dispute = require('../models/Dispute');
const { authenticateToken, requireAdminOrSupport } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/disputes
// @desc    Get all disputes with pagination and filtering
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
      assignedTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { disputeId: { $regex: search, $options: 'i' } },
        { 'customerEmail': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get disputes
    const disputes = await Dispute.find(filter)
      .populate('assignedTo', 'displayName email')
      .populate('jobId', 'title jobId')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Dispute.countDocuments(filter);

    res.json({
      success: true,
      data: {
        disputes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDisputes: total,
          hasNext: skip + disputes.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes',
      error: error.message
    });
  }
});

// @route   GET /api/disputes/:id
// @desc    Get dispute by ID
// @access  Private (Admin/Support)
router.get('/:id', requireAdminOrSupport, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('assignedTo', 'displayName email')
      .populate('jobId', 'title jobId customer')
      .populate('comments.author', 'displayName email')
      .populate('resolution.resolvedBy', 'displayName email');
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    res.json({
      success: true,
      data: { dispute }
    });

  } catch (error) {
    console.error('Get dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute',
      error: error.message
    });
  }
});

// @route   POST /api/disputes
// @desc    Create a new dispute
// @access  Private (Admin/Support)
router.post('/', requireAdminOrSupport, async (req, res) => {
  try {
    const {
      jobId,
      customerId,
      customerEmail,
      title,
      description,
      priority = 'medium',
      category,
      tags = []
    } = req.body;

    // Validation
    if (!jobId || !customerId || !customerEmail || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Job ID, customer ID, customer email, title, description, and category are required'
      });
    }

    // Create new dispute
    const dispute = new Dispute({
      jobId,
      customerId,
      customerEmail,
      title,
      description,
      priority,
      category,
      tags
    });

    await dispute.save();

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: { dispute }
    });

  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute',
      error: error.message
    });
  }
});

// @route   PUT /api/disputes/:id/assign
// @desc    Assign dispute to user
// @access  Private (Admin/Support)
router.put('/:id/assign', requireAdminOrSupport, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user ID is required'
      });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    await dispute.assignTo(assignedTo, req.user._id);

    res.json({
      success: true,
      message: 'Dispute assigned successfully',
      data: { dispute }
    });

  } catch (error) {
    console.error('Assign dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign dispute',
      error: error.message
    });
  }
});

// @route   POST /api/disputes/:id/comments
// @desc    Add comment to dispute
// @access  Private (Admin/Support)
router.post('/:id/comments', requireAdminOrSupport, async (req, res) => {
  try {
    const { message, isInternal = false, attachments = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required'
      });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    await dispute.addComment(req.user._id, req.user.displayName, message, isInternal, attachments);

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { dispute }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// @route   PUT /api/disputes/:id/resolve
// @desc    Resolve dispute
// @access  Private (Admin/Support)
router.put('/:id/resolve', requireAdminOrSupport, async (req, res) => {
  try {
    const { notes, resolutionType, customerSatisfied } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Resolution notes are required'
      });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    await dispute.resolve(req.user._id, notes, resolutionType, customerSatisfied);

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: { dispute }
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute',
      error: error.message
    });
  }
});

// @route   GET /api/disputes/stats/overview
// @desc    Get dispute statistics
// @access  Private (Admin/Support)
router.get('/stats/overview', requireAdminOrSupport, async (req, res) => {
  try {
    const stats = await Dispute.getDisputeStats();
    
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });
    const urgentDisputes = await Dispute.countDocuments({ isUrgent: true });
    
    const disputesThisMonth = await Dispute.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      success: true,
      data: {
        totalDisputes,
        openDisputes,
        resolvedDisputes,
        urgentDisputes,
        disputesThisMonth,
        statusBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Get dispute stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute statistics',
      error: error.message
    });
  }
});

module.exports = router; 