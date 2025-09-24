const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken, requireAdminOrSupport } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type = '', category = '' } = req.query;

    const filter = { isActive: true };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({
      ...filter,
      $or: [
        { target: 'all' },
        { target: 'specific_user', targetId: req.user._id.toString() },
        { target: 'role', targetRole: req.user.role },
        { target: 'technicians', targetRole: 'technician' }
      ],
      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    })
    .populate('createdBy', 'displayName email')
    .populate('data.jobId', 'title jobId')
    .populate('data.disputeId', 'title disputeId')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Notification.countDocuments({
      ...filter,
      $or: [
        { target: 'all' },
        { target: 'specific_user', targetId: req.user._id.toString() },
        { target: 'role', targetRole: req.user.role },
        { target: 'technicians', targetRole: 'technician' }
      ],
      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalNotifications: total,
          hasNext: skip + notifications.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id, req.user.role);

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private (Admin/Support)
router.post('/', requireAdminOrSupport, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      category = 'system',
      target = 'all',
      targetId = null,
      targetRole = null,
      priority = 'normal',
      scheduledFor = null,
      expiresAt = null,
      channels = ['in_app'],
      data = {}
    } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create new notification
    const notification = new Notification({
      title,
      message,
      type,
      category,
      target,
      targetId,
      targetRole,
      priority,
      scheduledFor,
      expiresAt,
      channels,
      data,
      createdBy: req.user._id
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead(req.user._id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { target: 'all' },
        { target: 'specific_user', targetId: req.user._id.toString() },
        { target: 'role', targetRole: req.user.role },
        { target: 'technicians', targetRole: 'technician' }
      ],
      isActive: true,
      'readBy.user': { $ne: req.user._id }
    });

    for (const notification of notifications) {
      await notification.markAsRead(req.user._id);
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/stats/overview
// @desc    Get notification statistics
// @access  Private (Admin/Support)
router.get('/stats/overview', requireAdminOrSupport, async (req, res) => {
  try {
    const stats = await Notification.getStats();
    
    const totalNotifications = await Notification.countDocuments();
    const sentNotifications = await Notification.countDocuments({ sent: true });
    const pendingNotifications = await Notification.countDocuments({ sent: false });
    const activeNotifications = await Notification.countDocuments({ isActive: true });
    
    const notificationsThisMonth = await Notification.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      success: true,
      data: {
        totalNotifications,
        sentNotifications,
        pendingNotifications,
        activeNotifications,
        notificationsThisMonth,
        typeBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification (soft delete)
// @access  Private (Admin/Support)
router.delete('/:id', requireAdminOrSupport, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

module.exports = router;