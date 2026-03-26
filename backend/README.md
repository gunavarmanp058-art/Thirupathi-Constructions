# TN Construction Company - Backend API

Production-ready Node.js backend with Clean Architecture and MySQL.

## Features
- **Clean Architecture**: Separation of routes, controllers, services, and middlewares.
- **MySQL Integration**: Using `mysql2/promise` with connection pooling.
- **Role-Based Auth**: Public, Client, and Admin access levels.
- **AI Modules**: Rule-based predictive maintenance and project tracking.
- **Media Uploads**: Weekly progress tracking with images/videos using Multer.
- **Error Handling**: Centralized error middleware with no crashes.

## Tech Stack
- Node.js (Express)
- MySQL
- JWT (Authentication)
- Bcrypt (Hashing)
- Multer (Local File Storage)

## Setup Steps
1. Create a MySQL database named `construction_db`.
2. Import `schema.sql` into your database.
3. Create a `.env` file (copy from `.env.example`).
4. Run `npm install`.
5. Run `npm run dev` to start with nodemon.

## Initial Accounts
- **Admin**: `admin@example.com` / `admin123` (Auto-seeded if enabled in .env)

## Example API Calls

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com", "password":"admin123"}'
```

### 2. Upload Weekly Progress (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/projects/1/progress \
     -H "Authorization: Bearer <TOKEN>" \
     -F "week_date=2026-02-10" \
     -F "planned_percent=80" \
     -F "actual_percent=75" \
     -F "notes=Road base layer completed" \
     -F "media=@path/to/image.jpg"
```

## Folder Structure
- `src/config`: DB pooling
- `src/controllers`: Business logic containers
- `src/middleware`: Auth, Upload, Error handlers
- `src/routes`: API entry points
- `src/services`: Shared logic (AI, etc.)
- `uploads/`: Local media storage
