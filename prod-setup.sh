#!/bin/bash

echo "🚀 Setting up MMT Cause Quest - Production Deployment"
echo "====================================================="


echo "✅ Node.js version: $(node -v)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 not found. Installing PM2 globally for process management..."
    npm install -g pm2
    echo "✅ PM2 installed successfully"
else
    echo "✅ PM2 is already installed: $(pm2 -v)"
fi

echo ""
echo "📦 Installing production dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install --production

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install --production
cd ..

# Install client dependencies (needed for build)
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "🏗️  Building application for production..."

# Build React client
echo "Building React client for production..."
cd client
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Client build completed successfully"
else
    echo "❌ Client build failed"
    exit 1
fi

cd ..

echo ""
echo "🔧 Setting up production configuration..."

# Create server .env file for production
if [ ! -f "server/.env.production" ]; then
    echo "Creating server/.env.production file..."
    cat > server/.env.production << EOL
# Production Database
MONGODB_URI=mongodb://localhost:27017/mmt-cause-quest-prod

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=mmt-cause-quest-production-jwt-secret-$(date +%s)

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://your-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-app-specific-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# External API Keys
GOOGLE_MAPS_API_KEY=your-production-google-maps-api-key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOL
    echo "✅ Created server/.env.production file"
    echo "⚠️  IMPORTANT: Please update all values in server/.env.production for your production environment"
else
    echo "✅ server/.env.production file already exists"
fi

# Create client production environment file
if [ ! -f "client/.env.production" ]; then
    echo "Creating client/.env.production file..."
    cat > client/.env.production << EOL
# Production API URL
REACT_APP_API_URL=http://your-domain.com:5000/api

# Disable source maps in production for security
GENERATE_SOURCEMAP=false

# Production optimizations
INLINE_RUNTIME_CHUNK=false
EOL
    echo "✅ Created client/.env.production file"
    echo "⚠️  Please update REACT_APP_API_URL in client/.env.production"
else
    echo "✅ client/.env.production file already exists"
fi

# Create necessary directories
mkdir -p server/uploads/activities
mkdir -p server/logs
echo "✅ Created production directories"

# Create PM2 ecosystem file
if [ ! -f "ecosystem.config.js" ]; then
    echo "Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'mmt-cause-quest-api',
      script: './server/index-db.js',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env_file: './server/.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './server/logs/err.log',
      out_file: './server/logs/out.log',
      log_file: './server/logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=2048'
    }
  ]
};
EOL
    echo "✅ Created PM2 ecosystem configuration"
else
    echo "✅ PM2 ecosystem configuration already exists"
fi

# Create nginx configuration template
if [ ! -f "nginx.conf.template" ]; then
    echo "Creating Nginx configuration template..."
    cat > nginx.conf.template << EOL
server {
    listen 80;
    server_name your-domain.com;

    # Serve React build files
    location / {
        root /path/to/your/project/client/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Handle socket.io connections
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL
    echo "✅ Created Nginx configuration template"
else
    echo "✅ Nginx configuration template already exists"
fi

# Create production startup script
if [ ! -f "start-production.sh" ]; then
    echo "Creating production startup script..."
    cat > start-production.sh << 'EOL'
#!/bin/bash

echo "🚀 Starting MMT Cause Quest in Production Mode"
echo "============================================="

# Load production environment
if [ -f "server/.env.production" ]; then
    export $(grep -v '^#' server/.env.production | xargs)
fi

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Show PM2 status
echo "PM2 Status:"
pm2 list

echo ""
echo "✅ Application started successfully!"
echo "📱 Frontend: Serve client/build with your web server (Nginx recommended)"
echo "🔗 Backend API: http://localhost:5000"
echo "📊 PM2 Monitoring: pm2 monit"
echo "📜 View Logs: pm2 logs mmt-cause-quest-api"
echo ""
echo "🔧 Management Commands:"
echo "   Restart: pm2 restart mmt-cause-quest-api"
echo "   Stop: pm2 stop mmt-cause-quest-api"
echo "   Reload: pm2 reload mmt-cause-quest-api"
echo ""
EOL
    chmod +x start-production.sh
    echo "✅ Created production startup script"
else
    echo "✅ Production startup script already exists"
fi

# Create production deployment checklist
cat > PRODUCTION_CHECKLIST.md << 'EOL'
# Production Deployment Checklist

## Pre-Deployment
- [ ] Update all API URLs in client/.env.production
- [ ] Set strong JWT_SECRET in server/.env.production
- [ ] Configure production database (MongoDB)
- [ ] Set up email service credentials
- [ ] Configure Google Maps API key
- [ ] Set up domain name and DNS
- [ ] Install and configure Nginx
- [ ] Set up SSL certificate (Let's Encrypt recommended)

## Security
- [ ] Change all default passwords and secrets
- [ ] Enable firewall (UFW recommended)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Review and update security headers
- [ ] Disable unnecessary ports

## Performance
- [ ] Configure Nginx gzip compression
- [ ] Set up CDN for static assets (optional)
- [ ] Configure database indexing
- [ ] Set up monitoring (PM2 monitoring, logs)
- [ ] Configure log rotation

## Post-Deployment
- [ ] Test all application features
- [ ] Verify API endpoints
- [ ] Check database connections
- [ ] Test file uploads
- [ ] Verify email functionality
- [ ] Set up backup strategy
- [ ] Configure monitoring alerts

## Maintenance
- [ ] Set up automated backups
- [ ] Configure log monitoring
- [ ] Plan update strategy
- [ ] Document rollback procedures
EOL

echo ""
echo "🎉 Production setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Review and update server/.env.production with your actual values"
echo "2. Review and update client/.env.production with your domain"
echo "3. Configure your web server (Nginx configuration provided)"
echo "4. Set up SSL certificate"
echo "5. Run ./start-production.sh to start the application"
echo ""
echo "📚 Files Created:"
echo "   📄 server/.env.production - Production environment variables"
echo "   📄 client/.env.production - Client production config"
echo "   📄 ecosystem.config.js - PM2 process configuration"
echo "   📄 nginx.conf.template - Nginx configuration template"
echo "   📄 start-production.sh - Production startup script"
echo "   📄 PRODUCTION_CHECKLIST.md - Deployment checklist"
echo ""
echo "🏗️  Built Assets:"
echo "   📁 client/build/ - Production React build"
echo ""
echo "🔧 Management:"
echo "   Start: ./start-production.sh"
echo "   Monitor: pm2 monit"
echo "   Logs: pm2 logs"
echo ""
echo "👥 Built by Team Manzil Makers for Production Deployment"
echo "====================================================="
