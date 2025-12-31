# 🎬 MERN Movie Application
> **Advanced Movie Management System with Role-Based Access Control (RBAC)**

![Status](https://img.shields.io/badge/Status-Live-success) ![Stack](https://img.shields.io/badge/Stack-MERN-blue) ![Deployment](https://img.shields.io/badge/Deployment-Render-purple)

This is a robust **Movie Web Application** built using the **MERN stack** (MongoDB, Express, React, Node.js). It features secure JWT authentication, admin-privileged movie management, and a unique **Offline Mode** that allows the application to run fully functional even without a database connection.

## 🚀 Live Demo
**[Live App Link](https://movie-application-sej8.onrender.com)**  
*(Hosted on Render - Backend & Frontend Monolith)*

---

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-Based Auth**: Secure login and registration.
- **Role-Based Access Control (RBAC)**:
  - **Users**: View, Search, and Sort movies.
  - **Admins**: Add, Edit, Queue, and Delete movies.
- **Fallback Security**: Robust error handling for production environments.

### 🛠️ Smart "Offline Mode"
- **Zero-Config Startup**: The app automatically detects if MongoDB is offline.
- **In-Memory Store**: Falls back to a mock data store for users and movies.
- **Seamless Experience**: Login, Registration, and CRUD operations work without a database (data resets on restart).

### 🎨 Frontend Experience
- **Modern UI**: Built with **React** and **Material-UI (MUI)**.
- **Responsive Design**: Fully optimized for desktop and mobile.
- **Dynamic Search & Sort**: Real-time filtering by title, rating, or release date.

### ⚡ Backend Performance
- **Express.js API**: RESTful architecture.
- **Bull Queue (Redis)**: Asynchronous processing for heavy tasks (optional).
- **Graceful Error Handling**: Detailed logging and user-friendly error messages.

---

## 🛠️ Technology Stack

| Component | Tech |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Material-UI, Axios |
| **Backend** | Node.js, Express.js, JWT, Express-Validator |
| **Database** | MongoDB (Compass/Atlas) + Mongoose |
| **Optional** | Redis, Bull Queue |

---

## 🏗️ Installation & Setup

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (Optional - App runs in Mock Mode without it)

### 2. Clone Repository
```bash
git clone https://github.com/Guptsonu22/Movie-Application.git
cd Movie-Application
```

### 3. Backend Setup
```bash
cd backend
npm install
# Start server (Auto-detects Offline Mode if DB is missing)
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```
*The app should now be running at `http://localhost:3000`*

---

## 🚢 Deployment Guide

This project is configured for **Monolithic Deployment** (Frontend served by Backend).

### Deploy to Render.com (Recommended)
1. **Push** code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your repository.
4. **Settings:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && cd ../frontend && npm install && npm run build`
   - **Start Command**: `node server.js`
5. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_secure_random_key`

---

## 📚 API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Get all movies (Pagination supported) | Public |
| `POST` | `/api/movies` | Create a new movie | **Admin** |
| `PUT` | `/api/movies/:id` | Update movie details | **Admin** |
| `DELETE` | `/api/movies/:id` | Remove a movie | **Admin** |
| `POST` | `/api/auth/login` | User login | Public |
| `POST` | `/api/auth/register` | User registration | Public |

---

## 🧪 Admin Credentials (Mock Mode)
If running without a database, use these credentials to access Admin features:
- **Email**: `sonuguptaji14@gmail.com`
- **Password**: `password123`

---

Built with ❤️ by **Sonu Kumar**
