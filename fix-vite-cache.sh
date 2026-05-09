#!/bin/bash
# Fix Vite Module Cache Issues

echo "🔧 Fixing Vite cache issues..."
echo ""

cd "$(dirname "$0")/frontend"

echo "1. Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
echo "   ✓ Cache cleared"
echo ""

echo "2. Cache cleared successfully!"
echo ""
echo "Now run:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
