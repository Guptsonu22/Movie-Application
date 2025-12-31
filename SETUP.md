# Setup Guide

This guide will help you set up and run the Movie Application locally.

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Movie Application"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create environment configuration file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movieapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

**Note**: 
- For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Redis is optional. If not available, the app will use direct database insertion

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create environment configuration file (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

### 4. Seed Database (Optional)

In the backend directory:

```bash
npm run seed
```

### 5. Create Admin User

In the backend directory:

```bash
npm run create-admin
```

Follow the prompts to create an admin user.

## MongoDB Setup Options

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/movieapp`

### Option 2: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string
6. Update `MONGODB_URI` in environment configuration

## Redis Setup (Optional)

### Option 1: Local Redis

1. Install Redis locally
2. Start Redis server
3. Use default connection: `redis://localhost:6379`

### Option 2: Redis Cloud (Recommended for Production)

1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Get your connection URL
4. Update `REDIS_URL` in environment configuration

**Note**: If Redis is not available, the application will automatically fall back to direct database insertion.

## Testing the Application

1. **Register a User**: Go to `/register` and create an account
2. **Login**: Use your credentials to login
3. **Browse Movies**: View movies on the home page
4. **Search**: Use the search page to find movies
5. **Admin Features**: Login as admin to add/edit/delete movies

## Troubleshooting

### Backend won't start

- Check if MongoDB is running
- Verify environment configuration exists and has correct values
- Check if port 5000 is available

### Frontend won't connect to backend

- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend environment configuration
- Check CORS settings in backend

### Queue errors

- Redis is optional. If you see queue errors, the app will use direct insertion
- To disable queue completely, don't set `REDIS_URL` in environment configuration

### Admin features not accessible

- Make sure you've created an admin user using `npm run create-admin`
- Verify the user's role is set to "admin" in the database

## Production Deployment

See the main README.md for deployment instructions to:
- Heroku/Railway/AWS (Backend)
- Vercel/Netlify (Frontend)
- MongoDB Atlas (Database)

