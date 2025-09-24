const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3002;
const frontendOrigin = process.env.FRONTEND_ORIGIN || '*';

// Initialize database and seed data
const seedDatabase = require('./scripts/seedDatabase');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({ 
  origin: frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const disputeRoutes = require('./routes/disputes');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);

// Basic API routes for development
app.get('/api/test', (req, res) => {
  res.json({ message: 'SmartFix API is running!', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Authentication middleware for socket
  socket.on('authenticate', async (token) => {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('./models/User');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartfix_secret_key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active') {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.user = user;
        
        // Join user to their personal room
        socket.join(`user-${user._id}`);
        
        // Join role-based rooms
        socket.join(`role-${user.role}`);
        
        // Join admin room if admin
        if (user.role === 'admin') {
          socket.join('admin-room');
        }
        
        socket.emit('authenticated', { success: true, user: user.getPublicProfile() });
        console.log(`👤 User authenticated: ${user.displayName} (${user.role})`);
        
        // Send initial dashboard data if admin/support
        if (['admin', 'support'].includes(user.role)) {
          socket.emit('dashboard-update', await getDashboardData());
        }
      } else {
        socket.emit('authentication-error', { message: 'Invalid user or inactive account' });
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('authentication-error', { message: 'Authentication failed' });
    }
  });

  // Handle real-time dashboard updates
  socket.on('request-dashboard-data', async () => {
    if (!socket.userId || !['admin', 'support'].includes(socket.userRole)) {
      return socket.emit('error', { message: 'Unauthorized' });
    }
    
    try {
      const dashboardData = await getDashboardData();
      socket.emit('dashboard-update', dashboardData);
    } catch (error) {
      console.error('Dashboard data error:', error);
      socket.emit('error', { message: 'Failed to fetch dashboard data' });
    }
  });

  // Handle job status updates
  socket.on('update-job-status', async (data) => {
    if (!socket.userId) {
      return socket.emit('error', { message: 'Authentication required' });
    }
    
    try {
      // Broadcast to all admin users
      io.to('admin-room').emit('job-status-changed', {
        jobId: data.jobId,
        status: data.status,
        updatedBy: socket.user.displayName
      });
      
      console.log(`Job ${data.jobId} status updated to ${data.status} by ${socket.user.displayName}`);
    } catch (error) {
      console.error('Job status update error:', error);
      socket.emit('error', { message: 'Failed to update job status' });
    }
  });

  // Handle notifications
  socket.on('send-notification', async (notification) => {
    if (!socket.userId || !['admin', 'support'].includes(socket.userRole)) {
      return socket.emit('error', { message: 'Unauthorized' });
    }
    
    try {
      // Send to specific user or broadcast
      if (notification.userId) {
        io.to(`user-${notification.userId}`).emit('notification', notification);
      } else if (notification.target === 'admins') {
        io.to('admin-room').emit('notification', notification);
      } else if (notification.target === 'role' && notification.role) {
        io.to(`role-${notification.role}`).emit('notification', notification);
      } else {
        io.emit('notification', notification);
      }
      
      console.log(`Notification sent by ${socket.user.displayName}:`, notification.title);
    } catch (error) {
      console.error('Send notification error:', error);
      socket.emit('error', { message: 'Failed to send notification' });
    }
  });

  // Handle user status updates
  socket.on('user-status-change', (status) => {
    if (socket.userId) {
      socket.broadcast.to('admin-room').emit('user-online-status', {
        userId: socket.userId,
        status: status,
        user: socket.user.displayName
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      // Notify admin room about user going offline
      socket.broadcast.to('admin-room').emit('user-online-status', {
        userId: socket.userId,
        status: 'offline',
        user: socket.user?.displayName
      });
      
      console.log(`🔌 User disconnected: ${socket.user?.displayName || socket.id}`);
    } else {
      console.log(`🔌 Anonymous user disconnected: ${socket.id}`);
    }
  });
});

// Helper function to get dashboard data
async function getDashboardData() {
  try {
    const User = require('./models/User');
    const Job = require('./models/Job');
    const Dispute = require('./models/Dispute');
    
    const [totalUsers, activeJobs, completedJobs, pendingDisputes] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments({ status: { $in: ['pending', 'assigned', 'in-progress'] } }),
      Job.countDocuments({ status: 'completed' }),
      Dispute.countDocuments({ status: { $in: ['open', 'in-progress'] } })
    ]);
    
    const recentJobs = await Job.find()
      .populate('customer technician')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    return {
      stats: {
        totalUsers,
        activeJobs,
        completedJobs,
        pendingDisputes
      },
      recentActivity: [
        ...recentJobs.map(job => ({
          id: job._id,
          type: 'job',
          message: `Job: ${job.title} - ${job.status}`,
          time: job.createdAt,
          user: job.customer?.displayName
        })),
        ...recentUsers.map(user => ({
          id: user._id,
          type: 'user',
          message: `New user registered: ${user.displayName}`,
          time: user.createdAt,
          user: user.displayName
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10)
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    return {
      stats: { totalUsers: 0, activeJobs: 0, completedJobs: 0, pendingDisputes: 0 },
      recentActivity: []
    };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Remove duplicate route definitions - already defined above

// Serve static files (for uploads)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value',
      field: Object.keys(err.keyValue)[0]
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB and seed database
connectDB().then(async () => {
  // Seed database with initial data in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      const seedStats = await seedDatabase();
      console.log(`🌱 Database seeded with ${seedStats.users} users, ${seedStats.jobs} jobs, ${seedStats.disputes} disputes, ${seedStats.notifications} notifications`);
    } catch (error) {
      console.log('⚠️ Database seeding skipped (data may already exist)');
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 SmartFix API with WebSocket support listening on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend Origin: ${frontendOrigin}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;