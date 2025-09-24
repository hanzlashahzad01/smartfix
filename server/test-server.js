const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartFix API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic API route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    data: {
      users: 1200,
      jobs: 500,
      disputes: 50
    }
  });
});

// Analytics API routes for landing page
app.get('/api/analytics/overview', (req, res) => {
  res.json({
    totalUsers: 1200,
    totalJobs: 500,
    totalDisputes: 50,
    totalNotifications: 200,
    activeUsers: 960,
    activeJobs: 125,
    completedJobs: 375,
    resolvedDisputes: 45
  });
});

app.get('/api/analytics/trends', (req, res) => {
  res.json({
    newUsers: 85,
    newJobs: 42,
    newDisputes: 3,
    completedJobs: 38,
    resolvedDisputes: 5
  });
});

app.get('/api/analytics/performance', (req, res) => {
  res.json({
    jobCompletionRate: '75.0',
    disputeResolutionRate: '90.0',
    averageResponseTime: '2.3h',
    customerSatisfaction: '4.8/5',
    userRetentionRate: '74%'
  });
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Handle admin room joining
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log(`👤 User joined admin room: ${socket.id}`);
    
    // Send initial connection confirmation
    socket.emit('dashboard-update', {
      totalUsers: 1200,
      totalJobs: 500,
      activeUsers: 960,
      completedJobs: 375
    });
  });

  // Handle notification sending
  socket.on('send-notification', (data) => {
    console.log('📢 Notification sent:', data);
    io.to('admin-room').emit('notification-sent', {
      id: Date.now(),
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle dashboard update requests
  socket.on('request-dashboard-update', () => {
    socket.emit('dashboard-update', {
      totalUsers: 1200,
      totalJobs: 500,
      totalDisputes: 50,
      activeUsers: 960,
      activeJobs: 125,
      completedJobs: 375
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 SmartFix API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🔌 WebSocket server ready for connections`);
});
