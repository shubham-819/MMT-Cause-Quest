# AWS Lightsail Production Deployment Checklist

## ✅ Completed by Script
- [x] Vite build configuration optimized
- [x] PM2 ecosystem for frontend + backend
- [x] Environment files with public IP (14.140.97.209)
- [x] Production-ready file structure
- [x] Memory-efficient Vite build process

## 🔥 AWS Lightsail Firewall Configuration (CRITICAL)
- [ ] Open port 3000 (TCP) for frontend access
- [ ] Open port 5000 (TCP) for backend API access
- [ ] Verify SSH port 22 is open
- [ ] Test firewall: `sudo ufw status`

## 🚀 Deployment Steps
1. [ ] Run: `./start-production.sh`
2. [ ] Verify frontend: http://14.140.97.209:3000
3. [ ] Verify backend: http://14.140.97.209:5000/api/health
4. [ ] Test full application functionality

## 🔧 Configuration Updates
- [ ] Update JWT_SECRET in server/.env.production
- [ ] Configure email service credentials (optional)
- [ ] Set Google Maps API key (optional)
- [ ] Review and adjust rate limiting settings

## 🔒 Security (AWS Lightsail)
- [ ] Change default JWT secret
- [ ] Review AWS Lightsail security groups
- [ ] Enable automatic OS updates
- [ ] Configure backup snapshots in Lightsail console
- [ ] Set up monitoring alerts

## 📊 Monitoring & Maintenance
- [ ] Monitor PM2 status: `pm2 monit`
- [ ] Set up log rotation: `pm2 install pm2-logrotate`
- [ ] Configure system monitoring
- [ ] Test restart procedures
- [ ] Document scaling procedures

## 🌐 Optional Domain Setup
- [ ] Purchase domain name
- [ ] Configure DNS A records to point to 14.140.97.209
- [ ] Set up SSL certificate (Let's Encrypt + Nginx)
- [ ] Update CORS settings for domain access

## 🎯 Performance Optimization
- [ ] Monitor application performance
- [ ] Optimize database queries
- [ ] Configure CDN for static assets (if needed)
- [ ] Set up application-level caching

## 🚨 Troubleshooting
- **Port not accessible**: Check AWS Lightsail firewall
- **Frontend not loading**: Check PM2 frontend logs
- **API not responding**: Check PM2 backend logs
- **Build failures**: Verify Vite dependencies

## 📱 Access URLs
- Frontend: http://14.140.97.209:3000
- Backend API: http://14.140.97.209:5000
- Health Check: http://14.140.97.209:5000/api/health
