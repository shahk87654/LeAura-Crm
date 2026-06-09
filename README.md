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
   cd backend && npm run build
   cd ../frontend && npm run build
   ```
2. Serve the backend from `backend/dist/server.js`.
3. Host the frontend `frontend/dist` assets on any static hosting.

## Notes

- Designed for MongoDB and JWT-based authentication
- Includes admin-only pages for users, packages, and reports
- Cleanly separated frontend/backends make deployment flexible
