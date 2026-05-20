# Ethera Team Task Manager

Full-stack Team Task Manager for teams with **Admin/Member roles**, project membership, task assignment, and a stats dashboard.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- API: REST

## Repo Structure
```
backend/   Express API + MongoDB models
frontend/  React app (Vite + Tailwind)
```

## Local Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend environment (`backend/.env`):
- `MONGO_URI` (local MongoDB or Atlas)
- `JWT_SECRET`
- `PORT` (default `5000`)
- `CORS_ORIGIN` (default `http://localhost:5173`)

Health check:
- `GET http://localhost:5000/api/health`

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend env (`frontend/.env`):
- `VITE_API_URL` (default `http://localhost:5000/api`)

## App Features

### Auth
- Signup / Login
- JWT stored in `localStorage`
- Protected routes + Logout

### Roles
- **Admin**
  - Create projects
  - Add/remove project team members
  - Create/update/delete tasks
  - Assign tasks to members
  - View full dashboard (all projects/tasks)
- **Member**
  - View assigned projects
  - View assigned tasks
  - Update status **only for their own assigned tasks**

### Projects
Project fields:
- `title`, `description`, `deadline`, `teamMembers`, `createdBy`

Rules:
- List: Admin sees all, Member sees only projects they are in.
- Update/Delete: Admin or creator.

### Tasks
Task fields:
- `title`, `description`, `projectId`, `assignedTo`, `priority`, `status`, `dueDate`

Rules:
- Assigned user must be in the project team (validated server-side).
- Overdue tasks: `dueDate < now` and `status != Completed`
- Member can update status via `PATCH /api/tasks/:taskId/my-status`

### Dashboard
- Total projects/tasks/completed/pending/overdue
- Tasks grouped by status
- Admin sees all, Member sees assigned-only data

### UI / Themes
- Dark mode toggle
- Accent theme picker (Indigo/Emerald/Rose/Amber/Cyan) persisted in `localStorage`

## API Endpoints (REST)
- Auth
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Dashboard
  - `GET /api/dashboard`
- Users (Admin only)
  - `GET /api/users`
  - `PATCH /api/users/:userId/role`
- Projects
  - `GET /api/projects`
  - `POST /api/projects` (Admin)
  - `GET /api/projects/:projectId`
  - `PATCH /api/projects/:projectId`
  - `DELETE /api/projects/:projectId`
  - `POST /api/projects/:projectId/members/add` (Admin)
  - `POST /api/projects/:projectId/members/remove` (Admin)
- Tasks
  - `GET /api/tasks` (supports `projectId`, `status`, `overdue=true`)
  - `POST /api/tasks` (Admin)
  - `GET /api/tasks/:taskId`
  - `PATCH /api/tasks/:taskId` (Admin)
  - `DELETE /api/tasks/:taskId` (Admin)
  - `PATCH /api/tasks/:taskId/my-status` (Member/self)

## Troubleshooting

### CORS error in browser
Make sure:
- Backend is running on `http://localhost:5000`
- Frontend is running on `http://localhost:5173`
- `backend/.env` has `CORS_ORIGIN=http://localhost:5173`
Then restart backend (`Ctrl+C` → `npm run dev`).

### MongoDB connection refused
If you see `ECONNREFUSED 127.0.0.1:27017`, MongoDB isn’t running locally or your Atlas URI isn’t being used.
Verify `backend/.env` contains your real `MONGO_URI`.

### “Only one project can be created per user every 30s”
This message is not produced by the app’s backend code. It typically comes from a proxy/hosting rate-limit layer.
If you’re running locally and still see it, hard-refresh and ensure you’re calling your local backend URL (`VITE_API_URL`).
