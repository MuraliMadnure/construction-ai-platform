# 🔧 Complete Setup & Wiring Guide

This guide explains how the Construction AI Platform is wired together and provides detailed setup instructions.

## 📋 Table of Contents

1. [System Architecture & Data Flow](#system-architecture--data-flow)
2. [Comprehensive Forms](#comprehensive-forms)
3. [Backend Wiring](#backend-wiring)
4. [Database Schema Updates](#database-schema-updates)
5. [Complete Setup Instructions](#complete-setup-instructions)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture & Data Flow

### Request Flow: Frontend → Backend → Database

```
┌──────────────┐
│  React Form  │  (Multi-section tabbed forms with 30-50+ fields)
└──────┬───────┘
       │
       │ Form Submit
       ▼
┌──────────────────┐
│ Service Layer    │  (project.service.js, resource.service.js, etc.)
│ (API Client)     │
└──────┬───────────┘
       │
       │ HTTP POST/PUT with JWT
       ▼
┌──────────────────┐
│ Express Routes   │  (Authenticate → RBAC → Controller)
└──────┬───────────┘
       │
       │ Request validation
       ▼
┌──────────────────┐
│  Controller      │  (Extract core + details fields)
└──────┬───────────┘
       │
       │ Data extraction & transformation
       ▼
┌──────────────────┐
│  Prisma ORM      │  (Store in PostgreSQL)
└──────┬───────────┘
       │
       │ SQL INSERT/UPDATE
       ▼
┌──────────────────┐
│  PostgreSQL DB   │
│  ├─ Core Fields  │  (Dedicated columns: name, status, dates)
│  └─ details JSON │  (Extended fields: client info, compliance, etc.)
└──────────────────┘
```

---

## 📝 Comprehensive Forms

All major forms in the platform have been upgraded to comprehensive multi-section interfaces:

### 1. Projects Form (7 Sections, 30+ Fields)

**Frontend**: `frontend/src/pages/ProjectsPage.jsx`

**Sections**:
- 📋 Basic Information (name, description, type, location, dates, budget)
- 👤 Client Details (name, contact, email, address, GSTIN)
- 🏗️ Contractor Information (name, contact, email, license)
- 📐 Specifications (construction type, area, floors, units)
- 👷 Team Members (engineer, site engineer, safety officer, QC lead)
- 🛡️ Compliance (permits, clearances, insurance)
- 💰 Financial Terms (contract value, payment terms, advance, retention)

**Storage**:
- Core fields → `projects` table columns
- Extended fields → `projects.details` JSON column

---

### 2. Worker Form (8 Sections, 50+ Fields)

**Frontend**: `frontend/src/pages/ResourcesPage.jsx`

**Sections**:
- 📋 Personal Information (name, DOB, gender, blood group, contact)
- 📍 Address Details (full address, city, state, pincode)
- 📄 Documents (Aadhar, PAN, voter ID, driving license)
- 👔 Professional Details (skill type, specialization, certifications, experience)
- 💼 Employment Information (joining date, contract type, salary, allowances)
- 🏥 Health & Safety (medical conditions, allergies, vaccinations)
- 🚨 Emergency Contacts (name, relation, phone, address)
- 🏦 Bank Details (account number, IFSC, bank name, branch)

**Storage**:
- Core fields → `workers` table columns
- Extended fields → `workers.details` JSON column

---

### 3. Equipment Form (8 Sections, 50+ Fields)

**Frontend**: `frontend/src/pages/ResourcesPage.jsx`

**Sections**:
- 📋 Basic Information (name, type, model, serial number)
- ⚙️ Technical Specifications (manufacturer, year, engine, fuel, capacity)
- 💳 Purchase Details (supplier, invoice, date, cost, warranty)
- 🔧 Operational Information (operator required, fuel consumption, running cost)
- 💰 Financial Details (depreciation, rental cost, insurance)
- 📋 Compliance (registration, pollution cert, fitness cert)
- 📍 Location & Assignment (current location, assigned project)
- 🛠️ Maintenance (last service, next service, spares, breakdown history)

**Storage**:
- Core fields → `equipment` table columns
- Extended fields → `equipment.details` JSON column

---

### 4. BOQ Form (8 Sections, 50+ Fields)

**Frontend**: `frontend/src/pages/BOQPage.jsx`

**Sections**:
- 📋 Basic Information (item code, description, unit, quantity)
- 📐 Specifications (specifications, brand preference)
- 🧱 Materials (material details, supplier)
- 👷 Labor & Equipment (labor requirements, equipment needed)
- 💰 Cost Analysis (material/labor/equipment costs, margins, GST)
- 📅 Schedule (start/end dates, estimated days, dependencies)
- ✅ Quality (standards, testing requirements, acceptance criteria)
- 📝 Additional (notes, assumptions, exclusions, risk factors)

**Storage**:
- Core fields → `boq_line_items` table columns
- Extended fields → `boq_line_items.details` JSON column

---

### 5. Material Order Form (7 Sections, 40+ Fields)

**Frontend**: `frontend/src/pages/MaterialsPage.jsx`

**Sections**:
- 📦 Basic Information (material, quantity, unit, priority)
- 🏢 Supplier Details (name, contact, GSTIN, address, email)
- 💰 Cost Details (unit price, quantity, GST, freight, total)
- 🚚 Delivery Information (expected date, address, contact, method)
- ✅ Quality Standards (standards, inspection required, certifications)
- 📄 Terms & Conditions (payment terms, warranty, return policy, penalty)
- 📝 Additional (PO number, requisition, budget code, instructions)

**Storage**:
- Core fields → `purchase_orders` table columns
- Extended fields → `purchase_orders.details` JSON column

---

### 6. Daily Report Form (10 Sections, 40+ Fields)

**Frontend**: `frontend/src/pages/ReportsPage.jsx`

**Sections**:
- 📋 Project Information (project, date, reported by, shift)
- 🌤️ Weather & Site (weather, temperature, humidity, site conditions)
- 👷 Attendance (workers present, absent, work hours, overtime, skill breakdown)
- 📊 Progress (summary, completed tasks, pending tasks, completion %, delays)
- 🧱 Materials (materials used, wastage, shortage)
- 🚜 Equipment (equipment used, breakdowns, idle time)
- 🛡️ Safety (observations, incidents, PPE compliance, violations)
- ✅ Quality (inspections, issues, testing results)
- ⚠️ Challenges (challenges faced, obstacles, remedial actions)
- 📅 Tomorrow's Plan (planned activities, required resources, critical activities)

**Storage**:
- Core fields → `daily_reports` table columns
- Extended fields → `daily_reports.details` JSON column

---

### 7. Site Issue Form (8 Sections, 30+ Fields)

**Frontend**: `frontend/src/pages/ReportsPage.jsx`

**Sections**:
- 📋 Basic Information (title, project, severity, issue type, description)
- 📍 Location Details (location, floor, zone, specific area)
- 💥 Impact Assessment (impact level, affected area, cost impact, time impact)
- 🔍 Root Cause Analysis (root cause, cause category, preventable)
- 🔧 Corrective Actions (immediate, suggested, corrective, preventive actions)
- 👤 Responsibility (responsible person, assigned to, target resolution date)
- 📎 Documentation (evidence photos, related documents, witness details)
- 📝 Additional (priority level, escalation required, notify stakeholders, remarks)

**Storage**:
- Core fields → `site_issues` table columns
- Extended fields → `site_issues.details` JSON column

---

## 🔌 Backend Wiring

### Data Extraction Utility

A utility function (`dataExtractor.js`) separates core fields from extended fields:

```javascript
// backend/src/utils/dataExtractor.js
exports.extractProjectData = (body) => {
  const coreFields = ['name', 'description', 'projectType', 'status', ...];
  const coreData = {};
  const details = {};

  // Separate core fields from extended fields
  Object.keys(body).forEach(key => {
    if (coreFields.includes(key)) {
      coreData[key] = body[key];
    } else if (body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details };
};
```

### Controller Pattern

Controllers use the utility to process comprehensive form data:

```javascript
// backend/src/controllers/project.controller.js
const { extractProjectData } = require('../utils/dataExtractor');

exports.createProject = async (req, res, next) => {
  const { coreData, details } = extractProjectData(req.body);

  // Transform data types
  if (coreData.startDate) coreData.startDate = new Date(coreData.startDate);
  if (coreData.budget) coreData.budget = parseFloat(coreData.budget);

  const project = await prisma.project.create({
    data: {
      ...coreData,
      details,  // All extended fields stored as JSON
      createdBy: req.user.id
    }
  });

  res.status(201).json({ success: true, data: { project } });
};
```

---

## 💾 Database Schema Updates

### Hybrid Storage Approach

The schema uses a hybrid approach with dedicated columns for queryable fields and JSON for extended data:

```prisma
model Project {
  // Core queryable fields
  id          String        @id @default(uuid())
  name        String
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime      @map("start_date") @db.Date
  endDate     DateTime      @map("end_date") @db.Date
  budget      Decimal       @db.Decimal(15, 2)

  // Extended data as JSON
  details     Json?         // All comprehensive form fields

  createdBy   String        @map("created_by")
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

### Models with `details` JSON Field

All major models now include a `details` field:
- ✅ `Project.details` - Client, contractor, team, compliance, financial details
- ✅ `Worker.details` - Personal, address, documents, employment, health, emergency, bank
- ✅ `Equipment.details` - Technical, purchase, operational, financial, compliance
- ✅ `BOQLineItem.details` - Specifications, materials, labor, schedule, quality
- ✅ `PurchaseOrder.details` - Supplier, delivery, quality, terms
- ✅ `DailyReport.details` - Weather, attendance, materials, equipment, safety, quality
- ✅ `SiteIssue.details` - Location, impact, root cause, actions, documentation

---

## 🚀 Complete Setup Instructions

### 1. Prerequisites

Install required software:

```bash
# Check Node.js version
node --version  # Should be v18+

# Check PostgreSQL
psql --version  # Should be v14+

# Check npm
npm --version   # Should be v9+
```

### 2. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd construction-ai-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb construction_ai_db

# Or using psql
psql -U postgres
CREATE DATABASE construction_ai_db;
\q
```

### 4. Configure Environment

#### Backend `.env`

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=5000

# Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/construction_ai_db"

# Generate strong secrets (use: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

CORS_ORIGIN=http://localhost:3000

# Optional: AI features
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend `.env`

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_ENV=development
VITE_APP_NAME=Construction AI Platform
VITE_APP_VERSION=1.0.0
```

### 5. Initialize Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Alternative: Run migrations (recommended for production)
npx prisma migrate dev --name init

# Optional: Seed database with sample data
npx prisma db seed
```

### 6. Start Development Servers

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

You should see:
```
🏗️ Construction AI Platform - Backend API
Environment:  development
Port:         5000
Database:     Connected ✓
Redis:        Connected ✓
Socket.IO:    Active ✓
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 7. Verify Setup

Visit these URLs:

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api/v1/docs
- **Prisma Studio**: Run `npx prisma studio` and open http://localhost:5555

---

## 🧪 Testing the Wiring

### 1. Test Project Creation

1. Navigate to http://localhost:3000
2. Login with seeded credentials or register
3. Go to Projects page
4. Click "+ New Project"
5. Fill out the comprehensive 7-section form
6. Submit

**Backend logs should show**:
```
Project created: [ProjectName] by user [email]
```

**Database verification**:
```bash
npx prisma studio
# Open 'projects' table
# Verify core fields and details JSON are populated
```

### 2. Test Worker Creation

1. Go to Resources page
2. Workers tab
3. Click "+ Add Worker"
4. Fill 8-section comprehensive form
5. Submit

**Verify in database**:
- Core fields: name, skillType, dailyWage, status
- Details JSON: all extended fields (address, documents, emergency, bank, etc.)

### 3. Test API Direct

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test authenticated endpoint (after login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/v1/projects
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection string
psql "postgresql://username:password@localhost:5432/construction_ai_db"

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### Port Already in Use

**Error**: `Port 5000 is already in use`

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

```bash
cd backend
npx prisma generate
npm install
```

### CORS Issues

**Error**: `Access to fetch...has been blocked by CORS`

1. Check backend `.env`:
   ```env
   CORS_ORIGIN=http://localhost:3000
   ```

2. Check frontend is running on port 3000

3. Clear browser cache

### JWT Authentication Issues

**Error**: `Invalid token` or `Token expired`

1. Check JWT secrets in backend `.env` are set
2. Clear localStorage in browser DevTools
3. Login again to get fresh token

### Form Data Not Saving

**Check**:
1. Backend controller receives data (add console.log)
2. Prisma schema has `details Json?` field
3. Database table has `details` column
4. Run `npx prisma db push` to sync schema

---

## 📊 Monitoring & Debugging

### Backend Logs

```bash
# Development logs (auto-enabled with npm run dev)
cd backend
npm run dev

# View logs in real-time
tail -f logs/combined.log
tail -f logs/error.log
```

### Database Queries

```bash
# Open Prisma Studio GUI
npx prisma studio

# SQL queries
psql construction_ai_db
\dt  # List tables
SELECT * FROM projects LIMIT 5;
SELECT details FROM projects WHERE id = 'some-id';
```

### Network Requests

Use browser DevTools:
1. Open Network tab
2. Perform action (create project, etc.)
3. Inspect request/response
4. Verify payload contains all form fields

---

## ✅ Verification Checklist

- [ ] PostgreSQL database created
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] `npx prisma generate` completed
- [ ] `npx prisma db push` completed
- [ ] Backend starts without errors on port 5000
- [ ] Frontend starts without errors on port 3000
- [ ] Can access frontend at http://localhost:3000
- [ ] Health check passes at http://localhost:5000/health
- [ ] Can register/login
- [ ] Can create project with full comprehensive form
- [ ] Data appears in database with details JSON populated
- [ ] Can create worker with all 50+ fields
- [ ] Can create equipment with comprehensive data
- [ ] All forms submit successfully

---

## 🎉 Success!

Your Construction AI Platform is now fully wired and operational!

All comprehensive forms (Projects, Workers, Equipment, BOQ, Materials, Reports) are connected end-to-end:

**Frontend Forms** → **API Services** → **Express Routes** → **Controllers** → **Prisma ORM** → **PostgreSQL Database**

The hybrid storage approach ensures:
- ✅ Core fields remain queryable for filtering/sorting
- ✅ Extended fields are preserved in JSON
- ✅ No data loss
- ✅ Easy to add new fields without migrations

---

## 📚 Next Steps

1. **Customize Forms**: Add/remove fields as needed (automatically stored in `details` JSON)
2. **Set up Redis**: For caching and better performance
3. **Configure Email**: For notifications and alerts
4. **Enable AI Features**: Add OpenAI/Anthropic API keys
5. **Deploy to Production**: Follow deployment guide in main README
6. **Add More Users**: Invite team members and assign roles
7. **Create Sample Data**: Use seed scripts or manual entry for testing

---

**Need Help?**
- Check main README.md for documentation links
- Review API documentation at `/api/v1/docs`
- Open GitHub issues for bugs/questions
