# SmartFix Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
# Clone and setup
git clone <repository-url>
cd smartfix

# Configure environment variables
cp .env.example .env.local
cp server/.env.example server/.env
# Edit the .env files with your configuration

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Option 2: Manual Deployment

#### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis (optional, for sessions)

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your .env file
npm start
```

#### Frontend Setup
```bash
npm install
cp .env.example .env.local
# Configure your .env.local file
npm start
```

#### Landing Page Setup
```bash
cd landing
npm install
npm run build
npm start
```

## 🌐 Production Deployment

### Environment Configuration

#### Backend (.env)
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
FRONTEND_ORIGIN=https://yourdomain.com
```

#### Frontend (.env.local)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

#### Landing Page (.env.local)
```env
NEXT_PUBLIC_ADMIN_ORIGIN=https://admin.yourdomain.com
```

### SSL Configuration
1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `nginx/ssl/` directory
3. Update nginx configuration for your domain

### Database Setup
```bash
# MongoDB with authentication
mongosh
use smartfix
db.createUser({
  user: "smartfix_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## 🔧 Environment Variables Reference

### Required Variables
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `FRONTEND_ORIGIN`: Frontend URL for CORS

### Optional Variables
- `FIREBASE_*`: Firebase configuration for push notifications
- `SMTP_*`: Email configuration for notifications
- `SESSION_SECRET`: Session encryption key for 2FA

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- Backend: `GET /health`
- Frontend: Available through nginx
- Database: MongoDB connection status

### Logging
- Application logs: `server/logs/`
- Nginx logs: `/var/log/nginx/`
- Docker logs: `docker-compose logs`

## 🔒 Security Checklist

### Production Security
- [ ] Change default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set secure JWT secrets
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular security updates
- [ ] Database authentication enabled
- [ ] File upload restrictions configured

### Default Credentials
**Admin User:**
- Email: admin@smartfix.com
- Password: admin123
- **⚠️ Change immediately after first login**

## 🚀 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database clustering
- Redis cluster for sessions
- CDN for static assets

### Performance Optimization
- Database indexing
- Caching strategies
- Image optimization
- Bundle size optimization

## 🆘 Troubleshooting

### Common Issues
1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access
   - Check authentication credentials

2. **CORS Errors**
   - Verify FRONTEND_ORIGIN setting
   - Check nginx configuration

3. **File Upload Issues**
   - Check directory permissions
   - Verify file size limits
   - Check disk space

4. **Socket.IO Connection Issues**
   - Verify WebSocket support
   - Check proxy configuration
   - Review firewall settings

### Debug Commands
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Check database connection
mongosh $MONGODB_URI

# Check API health
curl http://localhost:4000/health

# Check frontend build
npm run build
```

## 📈 Backup & Recovery

### Database Backup
```bash
# Create backup
mongodump --uri="$MONGODB_URI" --out=backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="$MONGODB_URI" backup/20240101/
```

### File Backup
```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz server/uploads/
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
cd server && npm install
cd ../landing && npm install

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Database Migrations
- Run migration scripts in `server/scripts/migrations/`
- Always backup before migrations
- Test migrations in staging first

---

For additional support, refer to the main README.md or contact the development team.
