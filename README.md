# MERN Movie Application with RBAC

This is a Movie Web Application built using the MERN stack (MongoDB, Express, React, Node.js). It features Role-Based Access Control (RBAC) for managing movies, utilizing a distributed queue for data operations.

## Features
- **User**: View top movies, search movies, sort movies by rating/duration/date.
- **Admin**: Add, edit, delete movies.
- **Authentication**: JWT-based login/signup with role management.
- **Performance**: Lazy insertion using Bull queue (Redis).

## Technologies
- **Frontend**: React, Material-UI, Vite.
- **Backend**: Node.js, Express, MongoDB, Bull (Redis).

## Setup
### Prerequisites
- Node.js
- MongoDB
- Redis (for Queue features)

### Installation
1. Clone the repository.
2. Setup Backend:
   ```bash
   cd backend
   npm install
   # Create environment file with MONGODB_URI, JWT_SECRET
   npm run seed # Optional: Seed with initial data
   npm run dev
   ```
3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## API Documentation
- **GET /api/movies**: Get all movies (supports ?page, ?search, ?sort)
- **POST /api/movies**: Add a movie (Admin only)
- **PUT /api/movies/:id**: Edit a movie (Admin only)
- **DELETE /api/movies/:id**: Delete a movie (Admin only)
- **POST /api/auth/register**: Register (role: 'user' or 'admin')
- **POST /api/auth/login**: Login

## Live URL
[https://movie-app-placeholder.vercel.app](https://movie-app-placeholder.vercel.app)
