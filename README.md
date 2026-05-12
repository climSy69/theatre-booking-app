# Theatre Booking App

A full-stack mobile theatre booking application built with **React Native (Expo)**, **Node.js**, **Express**, and **MySQL**.

---

# Overview

Theatre Booking App is a mobile application that allows users to:

- Create accounts and securely log in
- Browse theatres and performances
- View available showtimes
- Select seats interactively
- Create and manage reservations
- Cancel existing bookings

The project uses a modern mobile frontend built with **Expo + React Native** and a REST API backend powered by **Node.js**, **Express**, and **MySQL**.

---

# Features

## Authentication

- User registration
- Secure login
- JWT authentication
- Persistent sessions
- Auto login restore
- Logout support

## Theatre Browsing

- Browse available theatres
- Browse shows by theatre
- Browse available showtimes
- Public theatre/show API endpoints

## Booking System

- Interactive seat map
- Available / reserved / selected seat states
- Reservation conflict prevention
- Booking creation
- Booking cancellation
- Reservation history ("My Bookings")

## Mobile App Features

- Modern mobile UI
- API timeout handling
- Automatic backend URL detection
- AsyncStorage session persistence
- Expo Router navigation

---

# Tech Stack

## Frontend

- React Native
- Expo
- Expo Router
- TypeScript
- React Navigation
- AsyncStorage

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- CORS
- dotenv

## Database

- MySQL / MariaDB

## Development Tools

- npm
- ESLint
- nodemon
- Expo CLI

---

# Project Structure

```bash
project-root/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   └── server.js
│
├── frontend/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── config/
│   └── utils/
│
├── db_restore_v2.sql
├── db_backup_2026-04-28.sql
└── README.md
```

---

# Backend Architecture

## Important Files

### `backend/server.js`

- Express server setup
- Middleware registration
- Route mounting
- Health endpoint
- Runs on port `5000`

### `backend/db.js`

- MySQL database connection

### `middleware/authMiddleware.js`

- JWT verification middleware
- Protects authenticated routes

## Controllers

- `authController.js`
- `reservationController.js`
- `showtimeController.js`
- `theatreController.js`
- `showController.js`

These handle:

- Authentication
- Theatre browsing
- Showtime management
- Reservation creation/cancellation
- Seat availability checks

---

# Frontend Architecture

## Main Screens

| Screen | Description |
|---|---|
| Login | User login |
| Register | Account creation |
| Theatres | Browse theatres |
| Shows | Browse theatre shows |
| Showtimes | View available times |
| Booking | Interactive seat selection |
| My Bookings | Reservation history |

## Important Files

### `frontend/app/_layout.tsx`

Handles:

- Session restoration
- Navigation stack

### `components/SeatMap.tsx`

Interactive seat selection component.

### `utils/apiClient.ts`

Centralized API communication layer.

### `config/api.ts`

Automatically resolves backend IP during Expo development.

---

# Database

The application uses a MySQL database with seeded data.

## Included SQL Dumps

- `db_restore_v2.sql`
- `db_backup_2026-04-28.sql`

## Seeded Data

### Theatres

- National Theatre
- Pallas Theatre
- Thessaloniki Theatre

### Shows

- Hamlet
- Macbeth
- Mamma Mia
- Oedipus Rex

---

# API Overview

## Public Endpoints

- Browse theatres
- Browse shows
- Browse showtimes

## Protected Endpoints

Require JWT authentication.

- Create reservation
- Cancel reservation
- Fetch user bookings
- Update reservations

---

# Installation

## Prerequisites

Install:

- Node.js
- npm
- MySQL or MariaDB
- Expo Go (mobile) OR Android/iOS emulator

---

# Database Setup

```bash
mysql -u root -p < db_restore_v2.sql
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code using Expo Go.

---

# Environment Variables

Create a `.env` file inside `backend/`.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_app_v2
```

Optional frontend override:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000
```

---

# Troubleshooting

## Network Request Timed Out

Open:

```bash
http://<your-ip>:5000/api/theatres
```

If JSON appears, the backend is reachable.

Try:

```bash
npx expo start --tunnel
```

Ensure port `5000` is allowed through your firewall.

---

# Known Limitations

- No admin dashboard
- No payment integration
- No push notifications
- No automated tests
- Search/filter functionality not implemented
- Reservation editing incomplete
- Some Expo starter screens remain
- JWT secret currently hardcoded
- `.env.example` missing

---

# Future Improvements

- Admin dashboard
- Online payments
- Push notifications
- Search & filtering
- Reservation editing
- Email confirmations
- Better seat analytics
- CI/CD pipeline
- Unit & integration testing

---

# Author

**Alexandru Sacara Marian**
