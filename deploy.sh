#!/bin/bash

# Slack Extractor Deployment Script
# This script helps deploy the Slack extractor to a VPS

set -e

echo "🚀 Slack Extractor Deployment Script"
echo "====================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed: $(node --version)"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 is already installed: $(pm2 --version)"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your actual values:"
        echo "   nano .env"
        echo ""
        echo "Required variables:"
        echo "   - SLACK_BOT_TOKEN"
        echo "   - SLACK_WORKSPACE_ID"
        echo "   - DROPBOX_ACCESS_TOKEN"
        echo "   - DROPBOX_REFRESH_TOKEN"
        echo "   - DROPBOX_CLIENT_ID"
        echo "   - DROPBOX_CLIENT_SECRET"
        echo ""
        read -p "Press Enter after you've configured .env file..."
    else
        echo "❌ .env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create exports directory
mkdir -p exports

# Test the application
echo "🧪 Testing the application..."
if node src/index.js --once; then
    echo "✅ Application test successful!"
else
    echo "❌ Application test failed. Please check your configuration."
    exit 1
fi

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start src/index.js --name "slack-extractor"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
echo "⚙️  Setting up PM2 startup..."
pm2 startup

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Management commands:"
echo "   pm2 status              - View application status"
echo "   pm2 logs slack-extractor - View logs"
echo "   pm2 restart slack-extractor - Restart application"
echo "   pm2 stop slack-extractor - Stop application"
echo ""
echo "📁 CSV files will be saved to: ./exports/"
echo "☁️  Files will also be uploaded to Dropbox"
echo ""
echo "⏰ The application is now running and will extract data weekly on Mondays at 9 AM"
