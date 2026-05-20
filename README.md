# Ethera Team Task Manager

Full-stack Team Task Manager with role-based access.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- API: REST

## Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Environment variables (`backend/.env`):
- `MONGO_URI`
- `JWT_SECRET`
- `PORT`

Backend runs at `http://localhost:5000` and exposes API under `/api`.

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at the Vite URL (usually `http://localhost:5173`).

## Using the App
- Signup as **Admin** to create projects and manage tasks.
- Signup as **Member** to view assigned projects/tasks and update your task status.
- Admin can add members to a project from the Project Details page.

## API Overview
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/projects` / `POST /api/projects`
- `GET /api/projects/:projectId` / `PATCH` / `DELETE`
- `POST /api/projects/:projectId/members/add`
- `POST /api/projects/:projectId/members/remove`
- `GET /api/tasks` / `POST /api/tasks`
- `GET /api/tasks/:taskId` / `PATCH` / `DELETE`
- `PATCH /api/tasks/:taskId/my-status`

