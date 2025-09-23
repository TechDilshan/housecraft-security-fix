#!/bin/bash

# Environment Setup Script for HouseCraft Security Fix
echo "🔧 Setting up environment configuration..."

# Create .env file from template
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "✅ .env file created successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Please update the following values in .env:"
    echo "   - JWT_SECRET: Generate a strong, random secret key"
    echo "   - MONGODB_URI: Update if using a different database"
    echo "   - ALLOWED_ORIGINS: Add your production domains"
    echo ""
else
    echo "ℹ️  .env file already exists, skipping creation."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start MongoDB (if using local database)"
echo "3. Run: npm run dev (for frontend)"
echo "4. Run: node backend/server.js (for backend)"
echo ""
echo "For production deployment:"
echo "- Use environment variables instead of .env file"
echo "- Update JWT_SECRET with a strong, random value"
echo "- Configure proper CORS origins"
echo "- Use HTTPS in production"
