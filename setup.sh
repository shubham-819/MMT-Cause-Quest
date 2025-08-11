#!/bin/bash

echo "🚀 Setting up MMT Cause Quest - Volun-Tourism Platform (Vite + Amplify)"
echo "================================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    echo "   Please update Node.js and try again."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# SQLite database will be created automatically
echo "✅ Using SQLite database (no additional setup required)"

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

# Setup environment files
echo "🔧 Setting up environment configuration..."

# Create server .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "Creating server/.env file..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env file from template"
    echo "⚠️  Please update the values in server/.env as needed"
else
    echo "✅ server/.env file already exists"
fi

# Create client .env file if it doesn't exist
if [ ! -f "client/.env" ]; then
    echo "Creating client/.env file..."
    cp client/.env.example client/.env
    echo "✅ Created client/.env file from template"
else
    echo "✅ client/.env file already exists"
fi

# Create uploads directory
mkdir -p server/uploads/activities
echo "✅ Created uploads directory structure"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev          # Start both frontend and backend"
echo "   npm run client       # Start frontend only (Vite)"
echo "   npm run server       # Start backend only"
echo ""
echo "🏗️ To build for production:"
echo "   npm run build        # Build frontend"
echo "   npm run preview      # Preview production build"
echo ""
echo "📱 Development URLs:"
echo "   Frontend (Vite): http://localhost:3000"
echo "   Backend API:     http://localhost:5000"
echo ""
echo "☁️ AWS Amplify Deployment:"
echo "   • amplify.yml configuration included"
echo "   • Environment variables configured"
echo "   • Ready for full-stack deployment"
echo ""
echo "📚 Key features:"
echo "   🎯 React 18 with Vite for fast development"
echo "   🎨 Material-UI for beautiful components"
echo "   🚀 Full-stack deployment ready"
echo "   🔐 JWT authentication"
echo "   📱 Responsive design"
echo "   📊 SQLite database"
echo ""
echo "👥 Built by Team Manzil Makers"
echo "================================================================"
