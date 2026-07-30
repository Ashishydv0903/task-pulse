# Full-Stack CRUD Task Manager with User Authentication

A production-ready full-stack Task Management Application with user-based access control, JWT authentication, password hashing with bcrypt, input validation middleware, clean MVC backend architecture, and a modern glassmorphic React dashboard interface.

---

## 🌟 Features

- **Authentication & Security**:
  - Secure Registration & Login with password hashing (`bcryptjs` salt rounds: 10).
  - Stateless JSON Web Tokens (JWT) for session management.
  - Protected API routes with `authMiddleware` enforcing user isolation.
  - Strict input validation middleware for emails, passwords, and task data.
- **Task CRUD Operations**:
  - **Create**: Add tasks with title, description, priority (`low`, `medium`, `high`), category, status, and due date.
  - **Read**: Fetch user-scoped tasks with full-text search, multi-field filtering (status, priority, category), and sorting (`newest`, `oldest`, `priority`, `dueDate`).
  - **Update**: Edit task fields or perform quick 1-click status completion toggles.
  - **Delete**: Safely remove user tasks with confirmation.
- **Dashboard Metrics**:
  - Aggregate statistics overview (Total Tasks, In Progress, Completed, High Priority & Overdue alerts).
- **Modern UI / UX**:
  - Glassmorphic CSS design system with Dark and Light mode toggles.
  - Responsive Grid / List view layout switcher.
  - Toast notifications and interactive modal popups.

---

## 🏗️ MVC Architecture & Folder Structure

```
task-manager-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection (MongoDB + MongoMemoryServer fallback)
│   ├── controllers/
│   │   ├── authController.js     # User Auth controllers (Register, Login, Me)
│   │   └── taskController.js     # Task CRUD & Analytics controllers
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token authentication
│   │   ├── validateMiddleware.js # Payload and field format validation
│   │   └── errorMiddleware.js    # Global 404 & 500 error handler
│   ├── models/
│   │   ├── User.js               # Mongoose User model with pre-save hashing
│   │   └── Task.js               # Mongoose Task model with user ref
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── taskRoutes.js         # /api/tasks routes
│   ├── utils/
│   │   └── generateToken.js      # JWT token generator
│   ├── scripts/
│   │   └── seed.js               # Database seeding script (demo user & tasks)
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, TaskCard, FilterBar, StatCards, Modals, Toast
│   │   ├── context/              # AuthContext & Theme Provider
│   │   ├── services/             # Axios instance & token interceptors
│   │   ├── App.jsx               # Main dashboard coordinator
│   │   ├── index.css             # Glassmorphism CSS design system
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js            # Vite config with API proxy
│   └── package.json
└── README.md
```

---

## 📖 API Documentation & Route Reference

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | ❌ No | Register a new user account |
| `POST` | `/api/auth/login` | ❌ No | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | 🔒 Yes | Get authenticated user profile details |

#### Request Payload Examples

**`POST /api/auth/register`**
```json
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "66a8b123c456d7890e123456",
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 📋 Task CRUD Routes (`/api/tasks`)

> All task endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/tasks/stats` | 🔒 Yes | Aggregated metric counters for dashboard KPI cards |
| `GET` | `/api/tasks` | 🔒 Yes | List user tasks with optional search, filters & sort |
| `POST` | `/api/tasks` | 🔒 Yes | Create a new task owned by authenticated user |
| `GET` | `/api/tasks/:id` | 🔒 Yes | Get details for a single task |
| `PUT` | `/api/tasks/:id` | 🔒 Yes | Update task fields (title, description, status, etc.) |
| `DELETE` | `/api/tasks/:id` | 🔒 Yes | Delete task by ID |

#### Query Parameters for `GET /api/tasks`
- `search`: Filter by text in title or description (`?search=design`)
- `status`: Filter by status (`?status=pending` \| `in_progress` \| `completed`)
- `priority`: Filter by priority (`?priority=high` \| `medium` \| `low`)
- `category`: Filter by category (`?category=Work`)
- `sort`: Order results by `newest` (default), `oldest`, `priority`, or `dueDate`

#### Request Payload Example

**`POST /api/tasks`**
```json
{
  "title": "Design RESTful API Schema",
  "description": "Complete Mongoose schemas for users and tasks with Express JWT middleware.",
  "status": "in_progress",
  "priority": "high",
  "category": "Development",
  "dueDate": "2026-08-15T00:00:00.000Z"
}
```

---

## ⚡ Quick Start & Running Locally

### 1. Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Seed Database (Optional Demo Data)
```bash
cd backend
npm run seed
```
> **Demo Credentials:**
> - Email: `demo@example.com`
> - Password: `password123`

### 3. Run Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### 4. Run Frontend App
```bash
cd frontend
npm run dev
# Vite dev server will launch on http://localhost:3000
```

---

## 🧪 Testing with Postman / cURL

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123"}'
```

### 2. Log In to Get JWT Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### 3. Create Task (Include Bearer Token)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Audit Security Headers","priority":"high","category":"Security"}'
```
