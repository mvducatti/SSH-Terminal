#!/bin/bash

# Railway deployment script
echo "🚀 Preparing for Railway deployment..."

# Install dependencies
npm install

# Generate SSH keys if they don't exist
if [ ! -d "keys" ]; then
    echo "📦 Generating SSH keys..."
    node generate-keys.js
fi

echo "✅ Ready for Railway deployment!"
echo "📡 Your SSH server will be accessible via Railway domain"
echo "🌐 Connect with: ssh [your-railway-domain]"
