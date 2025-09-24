const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Dispute.deleteMany({});
    await Notification.deleteMany({});

    // Create admin user
    const adminUser = new User({
      uid: 'admin-001',
      email: 'admin@smartfix.com',
      displayName: 'Admin User',
      phoneNumber: '+923001234567',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      profile: {
        department: 'Administration',
        permissions: ['all'],
        bio: 'System Administrator'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created');

    // Create sample users
    const users = [
      {
        uid: 'user-001',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        phoneNumber: '+923001234568',
        password: 'password123',
        role: 'technician',
        status: 'active',
        profile: {
          department: 'Technical',
          bio: 'Senior Technician'
        }
      },
      {
        uid: 'user-002',
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        phoneNumber: '+923001234569',
        password: 'password123',
        role: 'support',
        status: 'active',
        profile: {
          department: 'Customer Support',
          bio: 'Support Specialist'
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Sample users created');

    // Create sample jobs
    const jobs = [
      {
        jobId: 'JOB-001',
        title: 'AC Repair Service',
        description: 'Air conditioning unit not cooling properly',
        customer: {
          name: 'Ahmed Ali',
          phone: '+923001234570',
          email: 'ahmed@example.com',
          address: {
            street: 'House 123, Block A',
            city: 'Lahore',
            state: 'Punjab',
            zipCode: '54000'
          }
        },
        technician: {
          id: createdUsers[0]._id,
          name: createdUsers[0].displayName,
          phone: createdUsers[0].phoneNumber
        },
        status: 'pending',
        priority: 'high',
        category: 'hvac',
        timeline: [
          {
            status: 'created',
            timestamp: new Date(),
            notes: 'Job created by customer',
            updatedBy: createdUsers[0]._id
          }
        ],
        estimatedCost: 5000,
        actualCost: 0
      },
      {
        jobId: 'JOB-002',
        title: 'Washing Machine Fix',
        description: 'Washing machine making loud noise',
        customer: {
          name: 'Sara Khan',
          phone: '+923001234571',
          email: 'sara@example.com',
          address: {
            street: 'Flat 456, Block B',
            city: 'Karachi',
            state: 'Sindh',
            zipCode: '75000'
          }
        },
        technician: {
          id: createdUsers[0]._id,
          name: createdUsers[0].displayName,
          phone: createdUsers[0].phoneNumber
        },
        status: 'in_progress',
        priority: 'medium',
        category: 'appliance',
        timeline: [
          {
            status: 'created',
            timestamp: new Date(Date.now() - 86400000),
            notes: 'Job created by customer',
            updatedBy: createdUsers[0]._id
          },
          {
            status: 'assigned',
            timestamp: new Date(Date.now() - 43200000),
            notes: 'Assigned to technician',
            updatedBy: createdUsers[0]._id
          },
          {
            status: 'in_progress',
            timestamp: new Date(),
            notes: 'Technician started work',
            updatedBy: createdUsers[0]._id
          }
        ],
        estimatedCost: 3000,
        actualCost: 0
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log('✅ Sample jobs created');

    // Create sample disputes
    const disputes = [
      {
        disputeId: 'DISP-001',
        jobId: createdJobs[0]._id,
        customerId: 'customer-001',
        customerEmail: 'ahmed@example.com',
        title: 'Service Quality Issue',
        description: 'Technician was late and service was not satisfactory',
        status: 'open',
        priority: 'high',
        category: 'service_quality',
        comments: [
          {
            author: createdUsers[0]._id,
            authorName: 'Ahmed Ali',
            message: 'The technician arrived 2 hours late and the AC is still not working properly.',
            timestamp: new Date(),
            isInternal: false
          }
        ]
      }
    ];

    await Dispute.insertMany(disputes);
    console.log('✅ Sample disputes created');

    // Create sample notifications
    const notifications = [
      {
        title: 'Welcome to SmartFix',
        message: 'Your account has been created successfully',
        type: 'info',
        category: 'system',
        target: 'all',
        sent: true,
        sentAt: new Date(),
        createdBy: adminUser._id,
        data: {
          metadata: {
            category: 'welcome'
          }
        }
      },
      {
        title: 'New Job Assignment',
        message: 'You have been assigned a new job: AC Repair Service',
        type: 'info',
        category: 'job_update',
        target: 'specific_user',
        targetId: createdUsers[0]._id.toString(),
        sent: true,
        sentAt: new Date(),
        createdBy: adminUser._id,
        data: {
          jobId: createdJobs[0]._id,
          metadata: {
            category: 'job'
          }
        }
      }
    ];

    await Notification.insertMany(notifications);
    console.log('✅ Sample notifications created');

    console.log('🎉 Database seeded successfully!');
    
    return {
      users: createdUsers.length + 1, // +1 for admin
      jobs: jobs.length,
      disputes: disputes.length,
      notifications: notifications.length
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

module.exports = seedDatabase;
