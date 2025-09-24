const express = require('express');
const { admin, initialized } = require('../firebase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
// Remove auth middleware for now to test basic functionality
// router.use(requireAuth);

// In-memory fallbacks for dev when Firebase is not initialized
const memory = {
  users: [],
  jobs: [],
  disputes: [],
  notifications: [],
};

// Mock data generator for development
const generateMockData = () => {
  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    users: Array.from({ length: 1200 }, (_, i) => ({
      id: `user_${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      createdAt: new Date(lastMonth.getTime() + Math.random() * (now.getTime() - lastMonth.getTime())),
      status: Math.random() > 0.2 ? 'active' : 'inactive'
    })),
    jobs: Array.from({ length: 500 }, (_, i) => ({
      id: `job_${i}`,
      title: `Job ${i}`,
      status: ['active', 'completed', 'pending', 'cancelled'][Math.floor(Math.random() * 4)],
      createdAt: new Date(lastMonth.getTime() + Math.random() * (now.getTime() - lastMonth.getTime())),
      completedAt: Math.random() > 0.6 ? new Date(lastMonth.getTime() + Math.random() * (now.getTime() - lastMonth.getTime())) : null
    })),
    disputes: Array.from({ length: 50 }, (_, i) => ({
      id: `dispute_${i}`,
      status: ['resolved', 'in_progress', 'escalated', 'closed'][Math.floor(Math.random() * 4)],
      createdAt: new Date(lastMonth.getTime() + Math.random() * (now.getTime() - lastMonth.getTime())),
      resolvedAt: Math.random() > 0.7 ? new Date(lastMonth.getTime() + Math.random() * (now.getTime() - lastMonth.getTime())) : null
    })),
    notifications: Array.from({ length: 200 }, (_, i) => ({
      id: `notif_${i}`,
      title: `Notification ${i}`,
      createdAt: new Date(lastMonth.getTime() + Math.random() * (now.getTime() - lastMonth.getTime()))
    }))
  };
};

// Initialize mock data
if (!initialized) {
  const mockData = generateMockData();
  memory.users = mockData.users;
  memory.jobs = mockData.jobs;
  memory.disputes = mockData.disputes;
  memory.notifications = mockData.notifications;
}

router.get('/overview', async (req, res, next) => {
  try {
    let data;
    
    if (!initialized) {
      data = {
        totalUsers: memory.users.length,
        totalJobs: memory.jobs.length,
        totalDisputes: memory.disputes.length,
        totalNotifications: memory.notifications.length,
        activeUsers: memory.users.filter(u => u.status === 'active').length,
        activeJobs: memory.jobs.filter(j => j.status === 'active').length,
        completedJobs: memory.jobs.filter(j => j.status === 'completed').length,
        resolvedDisputes: memory.disputes.filter(d => d.status === 'resolved').length,
      };
    } else {
      const [usersSnap, jobsSnap, disputesSnap, notificationsSnap] = await Promise.all([
        admin.firestore().collection('users').get(),
        admin.firestore().collection('jobs').get(),
        admin.firestore().collection('disputes').get(),
        admin.firestore().collection('notifications').get(),
      ]);

      data = {
        totalUsers: usersSnap.size,
        totalJobs: jobsSnap.size,
        totalDisputes: disputesSnap.size,
        totalNotifications: notificationsSnap.size,
        activeUsers: 0, // Would need to query with status filter
        activeJobs: 0,  // Would need to query with status filter
        completedJobs: 0, // Would need to query with status filter
        resolvedDisputes: 0, // Would need to query with status filter
      };
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/trends', async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let data;
    
    if (!initialized) {
      const filteredUsers = memory.users.filter(u => u.createdAt >= startDate);
      const filteredJobs = memory.jobs.filter(j => j.createdAt >= startDate);
      const filteredDisputes = memory.disputes.filter(d => d.createdAt >= startDate);
      
      data = {
        newUsers: filteredUsers.length,
        newJobs: filteredJobs.length,
        newDisputes: filteredDisputes.length,
        completedJobs: filteredJobs.filter(j => j.status === 'completed').length,
        resolvedDisputes: filteredDisputes.filter(d => d.status === 'resolved').length,
      };
    } else {
      // Firebase queries would go here
      data = {
        newUsers: 0,
        newJobs: 0,
        newDisputes: 0,
        completedJobs: 0,
        resolvedDisputes: 0,
      };
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/performance', async (req, res, next) => {
  try {
    let data;
    
    if (!initialized) {
      const totalJobs = memory.jobs.length;
      const completedJobs = memory.jobs.filter(j => j.status === 'completed').length;
      const totalDisputes = memory.disputes.length;
      const resolvedDisputes = memory.disputes.filter(d => d.status === 'resolved').length;
      
      data = {
        jobCompletionRate: totalJobs > 0 ? (completedJobs / totalJobs * 100).toFixed(1) : 0,
        disputeResolutionRate: totalDisputes > 0 ? (resolvedDisputes / totalDisputes * 100).toFixed(1) : 0,
        averageResponseTime: '2.3h', // Mock data
        customerSatisfaction: '4.8/5', // Mock data
        userRetentionRate: '74%', // Mock data
      };
    } else {
      data = {
        jobCompletionRate: 0,
        disputeResolutionRate: 0,
        averageResponseTime: '0h',
        customerSatisfaction: '0/5',
        userRetentionRate: '0%',
      };
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/revenue', async (req, res, next) => {
  try {
    const { period = '6m' } = req.query;
    let months;
    
    switch (period) {
      case '3m':
        months = 3;
        break;
      case '6m':
        months = 6;
        break;
      case '1y':
        months = 12;
        break;
      default:
        months = 6;
    }

    // Generate mock revenue data
    const revenueData = Array.from({ length: months }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (months - 1 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000) + 5000, // Random revenue between 5000-10000
        jobs: Math.floor(Math.random() * 50) + 20, // Random jobs between 20-70
      };
    });

    res.json({ revenueData });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 