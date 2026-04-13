# Al-Shatibi - Restaurant Management System

A full-stack food ordering platform with separate applications for customers and administrators.

## Project Structure

```
alshatibi/
├── backend/           # Node.js + Express + MongoDB API
├── customer-app/      # React + Vite customer-facing web app
└── admin-dashboard/   # React + Vite admin panel
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)

## Setup Instructions

### Backend

```bash
cd backend
npm install
```

Configure environment variables by creating a `.env` file in the `backend` folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the server:

```bash
npm start
```

### Customer App

```bash
cd customer-app
npm install
npm run dev
```

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

## Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Customer App:** React, Vite
- **Admin Dashboard:** React, Vite

## License

MIT
