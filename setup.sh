#!/bin/bash

# Sosh Social Media Platform - Quick Setup Script
# This script helps you set up the development environment quickly

echo "🚀 Sosh Social Media Platform - Setup Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🗄️  Step 2: Setting up local database..."
npm run db:migrate:local

echo ""
echo "🔧 Step 3: Configuring environment variables..."
if [ ! -f ".dev.vars" ]; then
    echo "⚠️  .dev.vars file not found. Creating from example..."
    cp .dev.vars.example .dev.vars
    echo "✅ Created .dev.vars file"
    echo "⚠️  IMPORTANT: Edit .dev.vars and add your API keys!"
else
    echo "✅ .dev.vars file already exists"
fi

echo ""
echo "🏗️  Step 4: Building the project..."
npm run build

echo ""
echo "🧹 Step 5: Cleaning port 3000..."
fuser -k 3000/tcp 2>/dev/null || true

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Edit .dev.vars and add your Facebook App credentials:"
echo "   - FACEBOOK_APP_ID"
echo "   - FACEBOOK_APP_SECRET"
echo "   - OPENAI_API_KEY (optional, for AI features)"
echo ""
echo "2. Start the development server:"
echo "   npm run dev:sandbox"
echo "   or"
echo "   pm2 start ecosystem.config.cjs"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "4. Register a new account and start using Sosh!"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full documentation"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - FACEBOOK_SETUP.md - Facebook integration setup"
echo ""
echo "🔗 Useful Commands:"
echo "   npm run build          - Build the project"
echo "   npm run dev:sandbox    - Start dev server"
echo "   npm run db:migrate:local - Apply database migrations"
echo "   npm run clean-port     - Kill process on port 3000"
echo "   pm2 logs              - View server logs"
echo "   pm2 restart all       - Restart all services"
echo ""
echo "✨ Happy building with Sosh!"
