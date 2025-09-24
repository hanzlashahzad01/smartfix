const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: {
    type: String,
    required: true,
    unique: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_review', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['billing', 'service_quality', 'technician_behavior', 'scheduling', 'equipment', 'other']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }]
  }],
  resolution: {
    notes: {
      type: String,
      trim: true,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionType: {
      type: String,
      enum: ['refund', 'rework', 'compensation', 'apology', 'other'],
      default: null
    },
    customerSatisfied: {
      type: Boolean,
      default: null
    }
  },
  escalation: {
    escalatedAt: {
      type: Date,
      default: null
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: {
      type: String,
      trim: true,
      default: null
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  customerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      trim: true,
      default: null
    },
    ratedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
disputeSchema.index({ disputeId: 1 });
disputeSchema.index({ jobId: 1 });
disputeSchema.index({ customerId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });
disputeSchema.index({ category: 1 });
disputeSchema.index({ assignedTo: 1 });
disputeSchema.index({ createdAt: -1 });
disputeSchema.index({ dueDate: 1 });
disputeSchema.index({ isUrgent: 1 });

// Pre-save middleware to generate dispute ID
disputeSchema.pre('save', function(next) {
  if (!this.disputeId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.disputeId = `DP${timestamp}${random}`;
  }
  next();
});

// Method to add comment
disputeSchema.methods.addComment = function(author, authorName, message, isInternal = false, attachments = []) {
  this.comments.push({
    author,
    authorName,
    message,
    isInternal,
    attachments,
    timestamp: new Date()
  });
  return this.save();
};

// Method to assign dispute
disputeSchema.methods.assignTo = function(userId, assignedBy) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  this.status = 'in_review';
  this.addComment(assignedBy, 'System', `Dispute assigned to technician`, true);
  return this.save();
};

// Method to resolve dispute
disputeSchema.methods.resolve = function(resolvedBy, notes, resolutionType, customerSatisfied = null) {
  this.status = 'resolved';
  this.resolution = {
    notes,
    resolvedBy,
    resolvedAt: new Date(),
    resolutionType,
    customerSatisfied
  };
  this.addComment(resolvedBy, 'System', `Dispute resolved: ${notes}`, true);
  return this.save();
};

// Method to escalate dispute
disputeSchema.methods.escalate = function(escalatedBy, escalatedTo, reason) {
  this.status = 'escalated';
  this.escalation = {
    escalatedAt: new Date(),
    escalatedBy,
    escalatedTo,
    reason
  };
  this.addComment(escalatedBy, 'System', `Dispute escalated: ${reason}`, true);
  return this.save();
};

// Method to add attachment
disputeSchema.methods.addAttachment = function(attachmentData, uploadedBy) {
  this.attachments.push({
    ...attachmentData,
    uploadedBy,
    uploadedAt: new Date()
  });
  return this.save();
};

// Static method to get dispute statistics
disputeSchema.statics.getDisputeStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get disputes by assigned user
disputeSchema.statics.getDisputesByUser = function(userId, limit = 10) {
  return this.find({ assignedTo: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('assignedTo', 'displayName email')
    .populate('jobId', 'title jobId')
    .exec();
};

module.exports = mongoose.model('Dispute', disputeSchema);
