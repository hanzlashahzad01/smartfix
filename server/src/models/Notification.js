const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'urgent'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['job_update', 'dispute_alert', 'system', 'promotion', 'maintenance', 'security'],
    default: 'system'
  },
  target: {
    type: String,
    enum: ['all', 'specific_user', 'role', 'technicians', 'customers'],
    required: true
  },
  targetId: {
    type: String,
    default: null
  },
  targetRole: {
    type: String,
    enum: ['admin', 'support', 'viewer', 'technician'],
    default: null
  },
  data: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actionUrl: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveryStatus: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    }
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    default: ['in_app']
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ target: 1, targetId: 1 });
notificationSchema.index({ targetRole: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ sent: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ isActive: 1 });

// Method to mark as read by user
notificationSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if read by user
notificationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function(deliveryStats = {}) {
  this.sent = true;
  this.sentAt = new Date();
  this.deliveryStatus = {
    sent: deliveryStats.sent || 0,
    delivered: deliveryStats.delivered || 0,
    failed: deliveryStats.failed || 0,
    pending: deliveryStats.pending || 0
  };
  return this.save();
};

// Method to schedule notification
notificationSchema.methods.schedule = function(scheduledFor) {
  this.scheduledFor = scheduledFor;
  return this.save();
};

// Method to expire notification
notificationSchema.methods.expire = function() {
  this.isActive = false;
  this.expiresAt = new Date();
  return this.save();
};

// Static method to get notifications for user
notificationSchema.statics.getForUser = function(userId, userRole, limit = 20, skip = 0) {
  const query = {
    isActive: true,
    $or: [
      { target: 'all' },
      { target: 'specific_user', targetId: userId.toString() },
      { target: 'role', targetRole: userRole },
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
  };

  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('createdBy', 'displayName email')
    .populate('data.jobId', 'title jobId')
    .populate('data.disputeId', 'title disputeId')
    .exec();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId, userRole) {
  const query = {
    isActive: true,
    $or: [
      { target: 'all' },
      { target: 'specific_user', targetId: userId.toString() },
      { target: 'role', targetRole: userRole },
      { target: 'technicians', targetRole: 'technician' }
    ],
    $and: [
      {
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      {
        'readBy.user': { $ne: userId }
      }
    ]
  };

  return this.countDocuments(query);
};

// Static method to get notification statistics
notificationSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          type: '$type',
          sent: '$sent'
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true
    },
    {
      $set: { isActive: false }
    }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
