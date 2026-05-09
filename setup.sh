#!/bin/bash

echo "🏗️  Construction AI Platform - Setup Script"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18.0.0 (current: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and update your credentials!"
fi

echo "Installing backend dependencies..."
npm install

echo "Generating Prisma Client..."
npx prisma generate

echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""

# Final instructions
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Run: cd backend && npx prisma migrate dev"
echo "3. Start backend: npm run dev"
echo "4. In new terminal, start frontend: cd frontend && npm run dev"
echo ""
echo "📚 See QUICK_START.md for detailed instructions"
echo ""

