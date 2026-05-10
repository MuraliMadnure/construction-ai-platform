# API Documentation

## Base URL
```
http://localhost:5001/api/v1
```

## Authentication
All endpoints (except auth) require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and get tokens |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password with token |
| GET | /auth/me | Get current user profile |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects | List all projects (paginated) |
| POST | /projects | Create a new project |
| GET | /projects/:id | Get project details |
| PUT | /projects/:id | Update project |
| DELETE | /projects/:id | Delete project |
| GET | /projects/:id/dashboard | Get project dashboard stats |
| GET | /projects/:id/members | Get project members |
| POST | /projects/:id/members | Add member to project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List tasks (filtered by project) |
| POST | /tasks | Create a new task |
| GET | /tasks/:id | Get task details |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /resources | List resources |
| POST | /resources | Create resource |
| PUT | /resources/:id | Update resource |
| DELETE | /resources/:id | Delete resource |

### Materials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /materials | List materials |
| POST | /materials | Create material |
| PUT | /materials/:id | Update material |
| DELETE | /materials/:id | Delete material |

### BOQ (Bill of Quantities)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /boq | List BOQ items |
| POST | /boq | Create BOQ item |
| PUT | /boq/:id | Update BOQ item |
| DELETE | /boq/:id | Delete BOQ item |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /reports | List reports |
| POST | /reports/generate | Generate a new report (PDF) |
| GET | /reports/:id/download | Download report |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/suggest-assignees | Get AI task assignment suggestions |
| POST | /ai/analyze-risk | Analyze project risk |
| POST | /ai/chat | Chat with AI assistant |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | Get user notifications |
| PUT | /notifications/:id/read | Mark notification as read |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |

## Query Parameters

### Pagination
Most list endpoints support:
- `page` (default: 1)
- `limit` (default: 20)

### Filtering
- `status` - Filter by status
- `search` - Search by name/description

## Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```
