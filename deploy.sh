#!/bin/bash

# ConvertAll Hub Deployment Script
echo "🚀 Starting ConvertAll Hub deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the project
echo "🏗️  Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Files ready in ./dist directory"
echo ""
echo "🌐 Deployment options:"
echo "  • Cloudflare Pages: Upload ./dist folder"
echo "  • Vercel: Connect GitHub repo for auto-deploy"
echo "  • Netlify: Drag & drop ./dist folder"
echo ""
echo "🔗 Don't forget to:"
echo "  • Update domain in sitemap.xml"
echo "  • Configure environment variables"
echo "  • Set up analytics tracking"
echo "  • Test all conversion tools"
echo ""
echo "🎉 Ready to launch!"