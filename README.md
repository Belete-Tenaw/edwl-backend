# Ethio Domestic Workers Link (EDWL)

Welcome to the **Ethio Domestic Workers Link (EDWL)** project! This is a full-stack web application designed to connect domestic workers with employers in Ethiopia.

## Project Structure

The project is divided into two main folders:

- **`backend/`**: A Node.js/Express server using Prisma with PostgreSQL. Handles authentication, data persistence, and business logic.
- **`frontend/`**: A React application built with Vite. Provides the user interface for Job Seekers, Employers, and Admins.

## Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (running locally or via a cloud provider)

## Getting Started

### 1. Setup the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - The `.env` file is already created. Open it and ensure `DATABASE_URL` matches your local PostgreSQL setup.
   - Example `DATABASE_URL="postgresql://user:password@localhost:5432/edwl_db?schema=public"`
4. Run Database Migrations (Prisma):
   ```bash
   npx prisma db push
   ```
5. Start the Server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Setup the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Development Server:
   ```bash
   npm run dev
   ```
   ```
   npm run dev
   ```
   The frontend will run on `http://localhost:3000` (or similar).

## Production Deployment

### Option 1: Docker (Recommended)
1. Set up your `.env` file in the `backend/` directory.
2. Run `docker-compose up --build -d`.
3. The application will be accessible at `http://localhost:5000`.

### Option 2: Manual (Cloud Hosting)
1. **Frontend**: Run `npm run build` in `/frontend`. Deploy the `dist` folder to Vercel/Netlify or let the backend serve it.
2. **Backend**: 
   - Deploy to Railway/Render.
   - Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
   - Run `npx prisma generate` before starting the server.

## Security & Performance
- **Rate Limiting**: Protected against brute-force attacks on all `/api` routes.
- **Security Headers**: Uses `helmet` for secure HTTP headers.
- **Bilingual**: Fully localized for English and Amharic.
- **Premium Model**: Quota limits for free users and conversation restrictions.

## Key Technologies
- **Frontend**: React (Vite), Lucide (Icons), Axios, i18next
- **Backend**: Express (v5), Prisma (v6), PostgreSQL, JWT, Bcrypt
- **Security**: express-rate-limit, helmet, morgan
