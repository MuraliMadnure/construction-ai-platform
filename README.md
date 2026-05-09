# 🏗️ Construction AI Platform

**AI-Driven Construction Planning & Management Software**

A comprehensive, enterprise-grade web platform for managing construction projects, specially designed for Temple Town / Eco Village infrastructure projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14-blue)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/react-18+-61DAFB)](https://reactjs.org/)

---

## ✨ Features

### 📊 Central Dashboard
- Live project status and progress tracking
- Budget overview and financial metrics
- Resource utilization monitoring
- AI-powered insights and recommendations
- Real-time notifications and alerts

### 📅 Project Planning & Scheduling
- Gantt chart visualization
- Task dependencies and milestones
- Timeline tracking and delay calculations
- Multi-project management
- Resource allocation planning

### 👷 Resource Management
- Worker allocation and shift planning
- Equipment tracking and maintenance
- Vehicle management
- Resource utilization analytics

### 💰 BOQ & Budget Module
- Bill of Quantities (BOQ) management
- Cost estimation and tracking
- Vendor comparison
- Budget approval workflows
- Expense tracking and variance analysis

### 🏗️ Site Execution Module
- Daily progress reports with photo uploads
- Work completion tracking
- Safety checklists
- Site issue reporting and resolution

### 📦 Material & Purchase Module
- Inventory management
- Stock level alerts
- Purchase request workflows
- Purchase order management
- Vendor management

### 🤖 AI Analytics Engine
- Delay prediction using ML
- Budget overrun alerts
- Productivity analysis
- AI-generated project summaries
- Smart resource recommendations

### 📈 Reporting Module
- PDF and Excel exports
- Daily/weekly/monthly reports
- Custom report templates
- Project analytics dashboards

### 🔔 Notification System
- Email alerts
- In-app notifications
- Task reminders
- Delay warnings
- Real-time updates via WebSocket

### 📹 Future: CCTV Integration
- Worker counting
- PPE detection
- Safety violation alerts
- Real-time site monitoring

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI framework
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching & caching
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Routing

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching & session store
- **Socket.IO** - Real-time communication
- **Bull** - Job queue
- **Winston** - Logging
- **JWT** - Authentication
- **Zod** - Validation

### AI/ML
- **OpenAI GPT-4** - AI insights & chat
- **Claude API** - Advanced reasoning
- **Custom ML models** - Predictions

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **GitHub Actions** - CI/CD

---

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0
- npm or yarn
- Docker (optional)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/construction-ai-platform.git
cd construction-ai-platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with API URL

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

### 4. Docker Setup (Alternative)

```bash
# From project root
docker-compose up -d
```

This starts all services:
- PostgreSQL (5432)
- Redis (6379)
- Backend API (5000)
- Frontend (3000)
- MinIO (9000)

---

## 📚 Documentation

- **[Complete Architecture](ARCHITECTURE.md)** - System design and architecture
- **[Database Schema](DATABASE_SCHEMA.md)** - Database structure and relationships
- **[UI/UX Design](UI_UX_DESIGN.md)** - Interface design specifications
- **[API Documentation](API_DOCUMENTATION.md)** - REST API endpoints
- **[Project Guide](PROJECT_COMPLETE_GUIDE.md)** - Comprehensive implementation guide

---

## 🏗️ Project Structure

```
construction-ai-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── validators/      # Input validation
│   │   ├── jobs/            # Background jobs
│   │   ├── sockets/         # WebSocket handlers
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema
│   ├── tests/               # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── utils/           # Utilities
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md
```

---

## 👥 User Roles

1. **Admin** - Full system access
2. **Project Manager** - Full project management
3. **Site Engineer** - Site operations & reports
4. **Purchase Team** - Material & procurement
5. **Finance Team** - Budget & expenses
6. **Contractor** - Assigned tasks only
7. **Viewer** - Read-only access

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS prevention
- CSRF protection
- Rate limiting
- Audit logging
- Secure file uploads

---

## 📊 Key Modules

### 1. Dashboard
Real-time project overview with KPIs, charts, and AI insights

### 2. Projects
Complete project lifecycle management from planning to completion

### 3. Tasks
Task creation, assignment, dependencies, and Gantt chart visualization

### 4. Resources
Worker, equipment, and vehicle management with allocation planning

### 5. BOQ & Budget
Bill of quantities, cost estimation, and expense tracking

### 6. Materials
Inventory management with automated stock alerts

### 7. Site Execution
Daily reports, safety checklists, and issue tracking

### 8. AI Analytics
Predictive analytics, delay forecasting, and optimization recommendations

### 9. Reports
Comprehensive reporting with PDF/Excel export capabilities

---

## 🤖 AI Features

- **Delay Prediction** - ML-based project delay forecasting
- **Budget Analysis** - Automated budget overrun detection
- **Resource Optimization** - Smart resource allocation suggestions
- **Report Summarization** - AI-generated daily summaries
- **BOQ Estimation** - AI-assisted quantity estimation
- **Chatbot Assistant** - Natural language project queries

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Projects
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
GET    /api/v1/projects/:id/dashboard
```

### Tasks
```
GET    /api/v1/projects/:id/tasks
POST   /api/v1/projects/:id/tasks
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

[See full API documentation](API_DOCUMENTATION.md)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:e2e
```

---

## 🚀 Deployment

### Using Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Using PM2

```bash
cd backend
pm2 start ecosystem.config.js --env production
```

### Cloud Platforms

- **AWS**: ECS/EKS + RDS + S3 + CloudFront
- **DigitalOcean**: App Platform + Managed Database
- **Vercel + Railway**: Frontend on Vercel, Backend on Railway

[See detailed deployment guide](DEPLOYMENT.md)

---

## 📈 Performance

- API response time: < 200ms
- Database queries: Optimized with proper indexing
- Caching: Redis for frequently accessed data
- CDN: Static assets served via CDN
- Compression: Gzip/Brotli enabled
- Lazy loading: Code splitting and lazy components

---

## 🔄 Development Workflow

```bash
main           # Production branch
├─ staging     # Staging environment
└─ develop     # Development branch
   ├─ feature/* # New features
   ├─ bugfix/*  # Bug fixes
   └─ hotfix/*  # Urgent fixes
```

---

## 📝 Environment Variables

### Backend
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret
OPENAI_API_KEY=your-key
REDIS_HOST=localhost
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for the construction industry
- Special thanks to all contributors
- Powered by modern open-source technologies

---

## 📞 Support

- 📧 Email: support@constructionai.com
- 📚 Documentation: https://docs.constructionai.com
- 💬 Discord: https://discord.gg/constructionai
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/construction-ai-platform/issues)

---

## 🗺️ Roadmap

### Q1 2026
- [x] Core platform development
- [x] AI integration
- [ ] Mobile app (React Native)
- [ ] CCTV integration

### Q2 2026
- [ ] Advanced analytics
- [ ] BIM integration
- [ ] Multi-language support
- [ ] Marketplace for contractors

### Q3 2026
- [ ] White-label solution
- [ ] Enterprise features
- [ ] Advanced AI models
- [ ] Blockchain contracts

---

## 📊 Status

- **Version**: 1.0.0
- **Status**: Production Ready 🚀
- **Last Updated**: January 2026
- **Active Development**: Yes

---

**Made with 💙 by the Construction AI Team**

*Transforming construction management with AI*
