# Stride

A full-stack productivity app with JWT authentication, task completion rewards, profile progress, dark mode, daily streaks, and weekly completion analytics.

## Stack

- React, JavaScript, Vite, Tailwind CSS, ShadCN-style UI components
- Node.js, Express.js, MongoDB, Mongoose
- JWT auth, Axios, React Router, Context API

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Copy backend environment file:

```bash
cp backend/.env.example backend/.env
```

3. Update `backend/.env` with your MongoDB connection string and JWT secret.

4. Run both apps:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/tasks`
- `GET /api/tasks?date=YYYY-MM-DD`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/complete`
- `DELETE /api/tasks/:id`
- `GET /api/users/profile`

Task payloads now use `startTime` and `endTime` in `HH:mm` format.
