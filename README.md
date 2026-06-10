# Le Aura Grand CRM

A polished events CRM for luxury venue teams, built with:
- React + Vite frontend
- Node/Express backend
- MongoDB database
- Tailwind CSS styling

## Project Overview

Le Aura Grand CRM helps venue managers and sales teams handle:
- lead capture and qualification
- follow-up planning with today/overdue/upcoming views
- event bookings and payment tracking
- calendar scheduling and visibility
- reporting and role-based admin controls

## Key Features

- Secure JWT authentication with admin and manager roles
- Lead management with event details, venue areas, and priority stages
- Follow-up scheduling and status tracking
- Bookings and payments management
- Analytics-ready reports dashboard
- Responsive, modern UI with branded styling

## Repository Structure

- `frontend/` — React + Vite application
- `backend/` — Express API using TypeScript and Mongoose

## Getting Started

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Configure `.env` values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`
4. Seed the initial admin user:
   ```bash
   npm run seed:admin
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/leaura
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Available Scripts

### Backend

- `npm run dev` — run dev server with nodemon
- `npm run build` — compile TypeScript app
- `npm run start` — start production server
- `npm run seed:admin` — seed default admin user
- `npm run seed:data` — seed sample data

### Frontend

- `npm run dev` — start Vite development server
- `npm run build` — build production bundle
- `npm run preview` — preview production build

## Deployment

1. Build both apps:
   ```bash
   npm install
   npm run build
   ```
2. Start the backend production server:
   ```bash
   npm run start
   ```
3. Optionally clean sample data before production use:
   ```bash
   cd backend
   npm run seed:clean
   ```

## Railway Deployment

This repo is now Railway-ready with a root `package.json` and `Procfile`.

1. Configure Railway environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (set to your deployed frontend URL or the Railway service URL)
   - `VITE_API_BASE_URL` (set to your Railway backend URL, e.g. `https://<railway-backend-url>/api`)

2. Set Railway start command to:
   ```bash
   npm run start
   ```

3. Build both apps before deployment using:
   ```bash
   npm run build
   ```

4. The backend will serve the built frontend assets from `frontend/dist` in production.

## Notes

- Designed for MongoDB and JWT-based authentication
- Includes admin-only pages for users, packages, and reports
- Cleanly separated frontend/backends make deployment flexible
