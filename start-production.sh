#!/bin/bash

echo "🚀 Starting MMT Cause Quest in Production Mode - AWS Lightsail"
echo "=============================================================="

# Get current IP addresses
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null || echo "YOUR_SERVER_IP")
PRIVATE_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")

echo "🌐 Server Information:"
echo "   Public IP: $PUBLIC_IP"
echo "   Private IP: $PRIVATE_IP"

# Load production environment
if [ -f "server/.env.production" ]; then
    export $(grep -v '^#' server/.env.production | xargs)
fi

# Start both frontend and backend with PM2
echo "Starting both frontend and backend with PM2..."
pm2 start ecosystem.config.js

# Show PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🎉 MMT Cause Quest started successfully!"
echo "========================================"
echo ""
echo "🌐 Access URLs:"
echo "   📱 Frontend: http://$PUBLIC_IP:3000"
echo "   🔗 Backend API: http://$PUBLIC_IP:5000"
echo "   ❤️  Health Check: http://$PUBLIC_IP:5000/api/health"
echo ""
echo "🔥 AWS Lightsail Firewall Settings:"
echo "   ✅ Port 3000 (TCP) - Frontend"
echo "   ✅ Port 5000 (TCP) - Backend API"
echo "   ✅ Port 22 (SSH) - Already configured"
echo ""
echo "📊 Management Commands:"
echo "   Monitor: pm2 monit"
echo "   Logs: pm2 logs"
echo "   Restart All: pm2 restart all"
echo "   Stop All: pm2 stop all"
echo "   Frontend Logs: pm2 logs mmt-cause-quest-frontend"
echo "   Backend Logs: pm2 logs mmt-cause-quest-api"
echo ""
echo "🔧 Troubleshooting:"
echo "   Check if ports are open: sudo ufw status"
echo "   View detailed logs: pm2 logs --lines 50"
echo "   Restart single app: pm2 restart mmt-cause-quest-api"
echo ""
