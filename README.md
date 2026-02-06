# Ethio Domestic Workers Link (EDWL)

Welcome to the **Ethio Domestic Workers Link (EDWL)** project! This is a full-stack web application designed to connect domestic workers with employers in Ethiopia.

## Project Structure

The project is divided into two main folders:

- **`backend/`**: A Node.js/Express server using Prisma with PostgreSQL. Handles authentication, data persistence, and business logic.
- **`frontend/`**: A React application built with Vite. Provides the user interface for Job Seekers, Employers, and Admins.

## Key Features
- **Bilingual Support**: Full English and Amharic support throughout the app.
- **Symmetric Verification**: Both workers and employers can be identity-verified by admins.
- **Secure Messaging**: Context-aware chat system with privacy protection.
- **Safety Reporting**: Users can report suspicious behavior; admins moderate via a dedicated dashboard.
- **Premium Model**: Manual subscription activation system via unique codes.
- **Audit Logging**: Comprehensive tracking of all critical system actions.

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
   The frontend will run on `http://localhost:3000` (or similar).

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd EDWL-Project
   ```
2. Copy environment template:
   ```bash
   cp .env.docker.template .env
   ```
3. Edit `.env` with your configuration:
   ```bash
   nano .env
   ```
4. Start all services:
   ```bash
   docker-compose up -d
   ```
5. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

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
- **RBAC**: Role-based access control with strict permission enforcement
- **Audit Logging**: All critical actions logged (logins, payments, admin actions)
- **Rate Limiting**: Anti-brute-force protection (10 login attempts/hour)
- **Data Privacy**: Sensitive data masking for freemium users
- **Security Headers**: Helmet.js for secure HTTP headers
- **Bilingual**: Fully localized for English and Amharic
- **Premium Model**: Quota limits for free users and messaging restrictions
- **Docker Ready**: Full containerization support
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Health Checks**: Built-in health monitoring for all services

## Key Technologies
- **Frontend**: React (Vite), Lucide (Icons), Axios, i18next
- **Backend**: Express (v5), Prisma (v6), PostgreSQL, JWT, Bcrypt
- **Security**: express-rate-limit, helmet, morgan
