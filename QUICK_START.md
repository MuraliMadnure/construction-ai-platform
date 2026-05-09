# 🚀 Quick Start Guide - Construction AI Platform

## 🔐 Default Login Credentials

```
Email:    admin@construction.com
Password: Admin@123
```

## Setup & Run

### 1. Seed Database (First Time Only)
```bash
cd backend
npm run prisma:seed
```

This creates:
- ✅ Admin user (admin@construction.com)
- ✅ All roles (admin, project_manager, site_engineer, etc.)
- ✅ Sample project

### 2. Start Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5001
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 4. Login
- Go to: http://localhost:3000/login
- Email: admin@construction.com
- Password: Admin@123

## ⚠️ Important
**Change the default password after first login!**

## 🐛 Troubleshooting

**Port 5001 in use?**
- Edit `backend/.env` → Change PORT=5002
- Edit `frontend/.env` → Change VITE_API_URL

**Seed already run?**
- Safe to run multiple times (uses upsert)

**Frontend module errors?**
- Run: `cd frontend && rm -rf node_modules/.vite && npm run dev`

---

For detailed setup: See [REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)
