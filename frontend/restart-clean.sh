#!/bin/bash
echo "🧹 Cleaning Vite cache and rebuilding..."
echo ""

# Stop any running processes
echo "1. Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf src/pages/*.backup
echo "   ✓ Done"
echo ""

echo "2. Restarting dev server..."
echo "   Run: npm run dev"
echo ""
echo "3. After restart, hard refresh browser:"
echo "   Windows: Ctrl+Shift+R"
echo "   Mac: Cmd+Shift+R"
echo ""
echo "✅ All caches cleared - ready to restart!"
