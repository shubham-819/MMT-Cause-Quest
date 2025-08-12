#!/bin/bash

echo "🚀 Setting up MMT Cause Quest - Volun-Tourism Platform"
echo "======================================================"

# Check if Node.js is installed
if ! node -v &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is running (optional - can use cloud)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
    # Check if MongoDB is running
    if pgrep mongod > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. You can:"
        echo "   1. Start local MongoDB: brew services start mongodb/brew/mongodb-community (macOS)"
        echo "   2. Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env"
    fi
else
    echo "⚠️  MongoDB not found locally. You can:"
    echo "   1. Install MongoDB locally"
    echo "   2. Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env"
fi

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "🔧 Setting up configuration..."

# Create server .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "Creating server/.env file..."
    cat > server/.env << EOL
# Database
MONGODB_URI=mongodb://localhost:27017/mmt-cause-quest

# JWT Secret
JWT_SECRET=mmt-cause-quest-super-secret-jwt-key-2024

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# External API Keys (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EOL
    echo "✅ Created server/.env file with default values"
    echo "⚠️  Please update the values in server/.env as needed"
else
    echo "✅ server/.env file already exists"
fi

# Create uploads directory
mkdir -p server/uploads
echo "✅ Created uploads directory"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📱 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Key features:"
echo "   🎯 Be a Cause - Create impact activities"
echo "   🤝 Join a Cause - Participate in activities"
echo "   🏆 Gamification - Points, badges, leaderboards"
echo "   ✅ TEM Verification - Quality assurance"
echo "   📍 Location Tracking - GPS verification"
echo ""
echo "👥 Built by Team Manzil Makers for HackForGood"
echo "======================================================"
