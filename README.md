# SmartFix - Complete Service Management Platform

A comprehensive MERN stack application for managing repair services with real-time updates, notifications, and advanced analytics.

## 🚀 Features

### Admin Dashboard (React.js)
- **User Management**: Complete CRUD operations with role-based access control
- **Job Management**: Create, assign, track, and manage repair jobs with drag & drop interface
- **Dispute Resolution**: Handle customer disputes with comment system and escalation
- **Real-time Notifications**: WebSocket-powered live updates and Firebase Cloud Messaging
- **Advanced Analytics**: Interactive charts and reports with export functionality
- **File Upload System**: Secure file handling for avatars, job attachments, and dispute evidence
<img width="1919" height="1014" alt="Screenshot 2026-01-07 170752" src="https://github.com/user-attachments/assets/979b316f-2a1e-4ce0-8416-050921a39c8e" />
<img width="1917" height="1031" alt="a2" src="https://github.com/user-attachments/assets/83fb92af-9a64-4e75-8f21-5ff1795a7506" />
<img width="1919" height="1032" alt="a3" src="https://github.com/user-attachments/assets/c751624e-c2b9-4422-bbf7-20b69c9793aa" />
<img width="1919" height="1033" alt="a4" src="https://github.com/user-attachments/assets/df8514a7-af07-4fce-b05e-c1ec603728e6" />
<img width="1919" height="1026" alt="a5" src="https://github.com/user-attachments/assets/a1d179d4-51be-45cc-a7ad-0083355265e3" />
<img width="1919" height="1032" alt="a6" src="https://github.com/user-attachments/assets/e9c8dfea-ec73-4468-8fdb-78d1316725f9" />
<img width="1919" height="1031" alt="a7" src="https://github.com/user-attachments/assets/87c9e97a-ef90-498a-a302-f4bf6ab61c68" />
<img width="1919" height="1034" alt="a8" src="https://github.com/user-attachments/assets/b44f323b-eba7-4cd0-a6ff-b8947f1e4b39" />


### Landing Page (Next.js)
- **Multilingual Support**: English and Urdu translations
- **Responsive Design**: Mobile-first approach with modern UI
- **SEO Optimized**: Meta tags, structured data, and performance optimization
- **Interactive Demo**: Live preview integration with admin dashboard

<img width="1919" height="1032" alt="l1" src="https://github.com/user-attachments/assets/b5207060-c8b8-425b-a601-acf91692209f" />
<img width="1919" height="1022" alt="l2" src="https://github.com/user-attachments/assets/cf1c4973-5f91-4f54-87ee-523f3df56938" />
<img width="1919" height="1027" alt="l3" src="https://github.com/user-attachments/assets/eed4f6c0-5514-4439-824c-09342efea3c7" />
<img width="1919" height="1022" alt="l4" src="https://github.com/user-attachments/assets/10676672-59c9-4fb8-9e9b-53532cdc9fe2" />
<img width="1919" height="1026" alt="l5" src="https://github.com/user-attachments/assets/3784e3d5-8089-4bb6-82f8-036d4d4a0838" />
<img width="1919" height="1030" alt="l6" src="https://github.com/user-attachments/assets/ba440a26-060b-4aee-9919-6461e74f0db3" />


### Backend API (Node.js + Express.js)
- **RESTful APIs**: Complete CRUD operations for all entities
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Admin, Support, Technician, and Viewer roles
- **Two-Factor Authentication**: TOTP-based 2FA with backup codes
- **Real-time Communication**: Socket.IO for live updates
- **File Upload**: Multer-based secure file handling
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Security Middleware**: Helmet, CORS, and input validation

## 🛠 Tech Stack

### Frontend
- **React.js 18** - Admin dashboard with hooks and context API
- **Next.js 14** - Landing page with SSR and TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and analytics
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload middleware
- **Speakeasy** - Two-factor authentication
- **QRCode** - QR code generation for 2FA setup

### Security & DevOps
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **bcrypt** - Password hashing
- **Input Validation** - Data sanitization
- **File Type Validation** - Secure file uploads

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd smartfix
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

### 3. Frontend Setup (Admin Dashboard)
```bash
cd ..
npm install
npm start
```

### 4. Landing Page Setup
```bash
cd landing
npm install
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env)
```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/smartfix

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Firebase Configuration (Optional)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_FIREBASE_VAPID_KEY=your_firebase_vapid_key
```

### Landing Page (.env.local)
```env
NEXT_PUBLIC_ADMIN_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - User logout

### Two-Factor Authentication
- `POST /api/auth/2fa/setup` - Initialize 2FA setup
- `POST /api/auth/2fa/enable` - Enable 2FA after verification
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA token
- `GET /api/auth/2fa/status` - Get 2FA status

### User Management
- `GET /api/users` - List users with pagination and filters
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `POST /api/users/bulk-action` - Bulk user operations

### Job Management
- `GET /api/jobs` - List jobs with pagination and filters
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `PUT /api/jobs/:id/status` - Update job status
- `PUT /api/jobs/:id/assign` - Assign technician to job

### Dispute Management
- `GET /api/disputes` - List disputes
- `GET /api/disputes/:id` - Get dispute by ID
- `POST /api/disputes` - Create new dispute
- `PUT /api/disputes/:id` - Update dispute
- `POST /api/disputes/:id/comments` - Add comment to dispute
- `PUT /api/disputes/:id/resolve` - Resolve dispute

### File Upload
- `POST /api/upload/avatar` - Upload user avatar
- `POST /api/upload/job/:jobId` - Upload job attachments
- `POST /api/upload/dispute/:disputeId` - Upload dispute attachments
- `DELETE /api/upload/file/:type/:id/:filename` - Delete file

### Analytics
- `GET /api/analytics/overview` - Dashboard overview stats
- `GET /api/analytics/trends` - Trend data
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/export` - Export analytics data

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Support, Technician, Viewer)
- Account lockout after failed login attempts
- Password strength requirements
- Two-factor authentication with TOTP

### Data Protection
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- SQL injection prevention
- XSS protection with Helmet
- CSRF protection
- Rate limiting on API endpoints

### File Security
- File type validation
- File size limits
- Secure file storage
- Path traversal prevention
- Malware scanning (configurable)

## 🌐 Real-time Features

### WebSocket Events
- `authenticate` - User authentication
- `join-user-room` - Join personal room
- `join-admin-room` - Join admin room
- `update-job-status` - Real-time job updates
- `send-notification` - Send notifications
- `user-status-change` - User online/offline status

### Push Notifications
- Firebase Cloud Messaging integration
- Device token management
- Targeted notifications by user/role
- Notification history and read status

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
npm run test:coverage
```

### Frontend Tests
```bash
npm test
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd server
npm run build

# Frontend
cd ..
npm run build

# Landing Page
cd landing
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

### Environment-specific Deployments
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Optimized build with security hardening

## 📊 Performance Optimization

### Backend
- Database indexing for optimal query performance
- Connection pooling for MongoDB
- Caching strategies for frequently accessed data
- Compression middleware for API responses
- Async/await patterns for non-blocking operations

### Frontend
- Code splitting and lazy loading
- Image optimization and compression
- Bundle size optimization
- Service worker for offline functionality
- CDN integration for static assets

## 🔍 Monitoring & Logging

### Application Monitoring
- Error tracking and reporting
- Performance metrics collection
- User activity analytics
- API response time monitoring
- Database query performance

### Logging
- Structured logging with Winston
- Log rotation and archival
- Error log aggregation
- Audit trail for sensitive operations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@smartfix.com
- Documentation: [docs.smartfix.com](https://docs.smartfix.com)
- Issues: [GitHub Issues](https://github.com/smartfix/smartfix/issues)

## 🎯 Roadmap

### Phase 1 (Completed)
- ✅ Core CRUD operations
- ✅ Authentication system
- ✅ Real-time features
- ✅ File upload system
- ✅ Two-factor authentication

### Phase 2 (Future)
- 📱 Mobile applications (React Native)
- 🔗 Third-party integrations (Payment gateways, Maps)
- 🤖 AI-powered job assignment
- 📈 Advanced analytics and reporting
- 🌍 Multi-tenant architecture

---

**SmartFix** - Streamlining service management with modern technology.
