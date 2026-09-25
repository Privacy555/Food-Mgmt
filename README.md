# 🍱 FoodShare — Food Donation Management System

A full-stack platform connecting restaurants (Vendors) with NGOs/orphanages (Receivers) to reduce food waste through efficient food donation management.

## ✨ Features

- **Role-based access** for Admin, Vendor, and Receiver
- **Admin portal** — verify and manage users, view global metrics
- **Vendor portal** — post food donations, track pickup status
- **Receiver portal** — interactive map of nearby donations, claim food
- **JWT authentication** with 7-day token expiry
- **Rate limiting** on auth endpoints (brute-force protection)
- **Auto-expiry** of stale donations via a background cron job

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken), bcrypt |
| Security | Helmet, express-rate-limit |
| Frontend | React + Vite |
| Routing | React Router DOM |
| Maps | React Leaflet + OpenStreetMap |
| Notifications | react-hot-toast |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Privacy555/Food-Mgmt.git
cd Food-Mgmt
```

### 2. Setup the backend
```bash
npm install
cp .env.example .env
# Edit .env with your values
```

### 3. Seed the admin account
```bash
node script/createAdmin.js
# Creates: admin@gmail.com / 12345
```

### 4. Start the backend
```bash
node server.js
# Runs on http://localhost:3000
```

### 5. Setup and start the frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 📋 API Routes

| Method | Route | Access |
|---|---|---|
| POST | `/vendors/register` | Public |
| POST | `/vendors/login` | Public |
| GET/POST | `/vendors/donations` | Vendor |
| POST | `/receivers/register` | Public |
| POST | `/receivers/login` | Public |
| GET | `/receivers/donations` | Receiver |
| POST | `/receivers/donations/:id/claim` | Receiver |
| POST | `/admin/admin/login` | Public |
| GET | `/admin/dashboard` | Admin |
| GET | `/admin/vendors/pending` | Admin |
| PUT | `/admin/vendors/:id/verify` | Admin |
| GET | `/admin/receivers/pending` | Admin |
| PUT | `/admin/receivers/:id/verify` | Admin |

## 🔐 Environment Variables

See [`.env.example`](.env.example) for all required variables.
