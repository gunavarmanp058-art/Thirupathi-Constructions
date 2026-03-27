# TN Construction Project

This project consists of three main components:
1.  **Frontend**: React + Vite + TypeScript (Client & Admin Portals)
2.  **Backend**: Node.js + Express + MySQL (API Server)
3.  **AI Service**: Python + FastAPI (Machine Maintenance & Project Prediction)

## Prerequisites

*   Node.js (v18+)
*   Python (v3.9+)
*   MySQL Server

## Setup Instructions

### 1. Database Setup

1.  Create a MySQL database named `construction_db`.
2.  Run the schema script located at `backend/schema.sql` to create tables.

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example` and update your database credentials:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=construction_db
    JWT_SECRET=your_jwt_secret
    AI_SERVICE_URL=http://localhost:8000
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    The backend will run on `http://localhost:5000`.

### 3. AI Service Setup

1.  Navigate to the `ai-service` directory:
    ```bash
    cd ai-service
    ```
2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install fastapi uvicorn
    ```
4.  Start the service:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The AI service will run on `http://localhost:8000`.

### 4. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  (Optional) Create a `.env` file if you need to point to a different backend URL:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the dev server:
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173` (or similar).

## Usage

1.  Ensure all three services (Database, Backend, AI Service) are running.
2.  Open the frontend URL in your browser.
3.  Login using the credentials (seed the database first if needed, usually an admin like `admin@example.com` / `admin123` is created in `backend/index.js` on first run if configured).

## Troubleshooting

*   **CORS Issues**: Ensure the backend allows requests from the frontend origin.
*   **Database Connection**: Check `backend/.env` credentials.
*   **AI Service**: If the AI service is down, the backend will fallback to local rule-based logic.
# Thirupathi-Constructions
