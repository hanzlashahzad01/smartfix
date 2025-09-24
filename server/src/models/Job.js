const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
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
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['electrical', 'plumbing', 'hvac', 'appliance', 'general', 'emergency']
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  technician: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: null
    }
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: String,
      default: null
    }
  }],
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
  estimatedCost: {
    type: Number,
    default: null
  },
  actualCost: {
    type: Number,
    default: null
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
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
  },
  tags: [{
    type: String,
    trim: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  requiresFollowUp: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
jobSchema.index({ jobId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ priority: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ 'customer.email': 1 });
jobSchema.index({ 'technician.id': 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ scheduledDate: 1 });
jobSchema.index({ isUrgent: 1 });

// Pre-save middleware to generate job ID
jobSchema.pre('save', function(next) {
  if (!this.jobId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.jobId = `SF${timestamp}${random}`;
  }
  next();
});

// Method to add timeline entry
jobSchema.methods.addTimelineEntry = function(status, notes, updatedBy, location = null) {
  this.timeline.push({
    status,
    notes,
    updatedBy,
    location,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status
jobSchema.methods.updateStatus = function(newStatus, notes, updatedBy) {
  this.status = newStatus;
  this.addTimelineEntry(newStatus, notes, updatedBy);
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to assign technician
jobSchema.methods.assignTechnician = function(technicianId, technicianName, estimatedDuration, updatedBy) {
  this.technician = {
    id: technicianId,
    name: technicianName,
    assignedAt: new Date(),
    estimatedDuration
  };
  this.addTimelineEntry('assigned', `Assigned to ${technicianName}`, updatedBy);
  return this.save();
};

// Method to add attachment
jobSchema.methods.addAttachment = function(attachmentData, uploadedBy) {
  this.attachments.push({
    ...attachmentData,
    uploadedBy,
    uploadedAt: new Date()
  });
  return this.save();
};

// Static method to get job statistics
jobSchema.statics.getJobStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get jobs by technician
jobSchema.statics.getJobsByTechnician = function(technicianId, limit = 10) {
  return this.find({ 'technician.id': technicianId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('technician.id', 'displayName email')
    .exec();
};

module.exports = mongoose.model('Job', jobSchema);
