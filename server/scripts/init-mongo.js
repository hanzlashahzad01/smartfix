// MongoDB initialization script for Docker
db = db.getSiblingDB('smartfix');

// Create collections
db.createCollection('users');
db.createCollection('jobs');
db.createCollection('disputes');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "uid": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "status": 1 });
db.users.createIndex({ "createdAt": -1 });

db.jobs.createIndex({ "jobId": 1 }, { unique: true });
db.jobs.createIndex({ "customer": 1 });
db.jobs.createIndex({ "technician": 1 });
db.jobs.createIndex({ "status": 1 });
db.jobs.createIndex({ "priority": 1 });
db.jobs.createIndex({ "createdAt": -1 });

db.disputes.createIndex({ "disputeId": 1 }, { unique: true });
db.disputes.createIndex({ "jobId": 1 });
db.disputes.createIndex({ "customer": 1 });
db.disputes.createIndex({ "status": 1 });
db.disputes.createIndex({ "priority": 1 });
db.disputes.createIndex({ "createdAt": -1 });

db.notifications.createIndex({ "target": 1 });
db.notifications.createIndex({ "type": 1 });
db.notifications.createIndex({ "sent": 1 });
db.notifications.createIndex({ "createdAt": -1 });

// Create default admin user
db.users.insertOne({
  uid: "admin_001",
  email: "admin@smartfix.com",
  displayName: "System Administrator",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/4L4r5tUvC", // password: admin123
  role: "admin",
  status: "active",
  profile: {
    avatar: null,
    department: "IT",
    permissions: ["all"],
    bio: "System Administrator"
  },
  twoFactor: {
    secret: null,
    enabled: false,
    backupCodes: []
  },
  lastLogin: null,
  loginAttempts: 0,
  lockUntil: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('SmartFix database initialized successfully!');
print('Default admin user created:');
print('Email: admin@smartfix.com');
print('Password: admin123');
print('Please change the default password after first login.');
