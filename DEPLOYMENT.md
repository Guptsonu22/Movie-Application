# Deployment Guide

This guide provides step-by-step instructions for deploying the Movie Application to production.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Heroku/Railway/AWS account (for backend)
- Vercel/Netlify account (for frontend)
- Redis account (optional, for queue functionality)

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the free tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `movieapp`)

## Step 2: Backend Deployment (Heroku)

### Option A: Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
   heroku config:set JWT_SECRET=your_super_secret_jwt_key
   heroku config:set JWT_EXPIRE=7d
   heroku config:set NODE_ENV=production
   heroku config:set REDIS_URL=your_redis_url  # Optional
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name-backend
   git push heroku main
   ```

6. **Check Logs**
   ```bash
   heroku logs --tail
   ```

### Option B: Railway

1. **Sign up at [Railway](https://railway.app/)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" or "Empty Project"

3. **Configure Project**
   - Add environment variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `JWT_EXPIRE=7d`
     - `NODE_ENV=production`
     - `PORT` (Railway sets this automatically)
     - `REDIS_URL` (optional)

4. **Deploy**
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Railway will auto-deploy on push

### Option C: AWS (EC2/Elastic Beanstalk)

1. **Create EC2 Instance** or use **Elastic Beanstalk**

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Node.js and Git**
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm git
   ```

4. **Clone and Setup**
   ```bash
   git clone your-repo-url
   cd "Movie Application/backend"
   npm install
   ```

5. **Set Environment Variables**
   ```bash
   export MONGODB_URI=your_mongodb_atlas_connection_string
   export JWT_SECRET=your_super_secret_jwt_key
   export JWT_EXPIRE=7d
   export NODE_ENV=production
   ```

6. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start server --name movie-app-backend
   pm2 save
   pm2 startup
   ```

## Step 3: Frontend Deployment (Vercel)

### Option A: Vercel

1. **Sign up at [Vercel](https://vercel.com/)**

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

3. **Configure Build Settings**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Set Environment Variables**
   - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-app-name-backend.herokuapp.com/api`)

5. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every push to main branch

### Option B: Netlify

1. **Sign up at [Netlify](https://www.netlify.com/)**

2. **Import Project**
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set base directory to `frontend`

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add `REACT_APP_API_URL`: Your backend API URL

5. **Deploy**
   - Click "Deploy site"
   - Netlify will auto-deploy on every push

## Step 4: Redis Setup (Optional)

### Option A: Redis Cloud (Free Tier)

1. **Sign up at [Redis Cloud](https://redis.com/try-free/)**

2. **Create Database**
   - Choose free tier
   - Select region
   - Create database

3. **Get Connection URL**
   - Copy the connection URL
   - Add to backend environment variables as `REDIS_URL`

### Option B: Upstash Redis

1. **Sign up at [Upstash](https://upstash.com/)**

2. **Create Redis Database**
   - Click "Create Database"
   - Choose region
   - Copy connection URL

3. **Add to Backend Environment Variables**

## Step 5: Update CORS Settings

In backend server configuration, update CORS to allow your frontend domain:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Add `FRONTEND_URL` to your backend environment variables.

## Step 6: Create Admin User

After deployment, create an admin user:

1. **Using MongoDB Atlas**
   - Go to MongoDB Atlas → Collections
   - Find the `users` collection
   - Edit a user document and set `role: "admin"`

2. **Using Backend Script (if accessible)**
   ```bash
   heroku run npm run create-admin
   ```

## Step 7: Test Deployment

1. **Test Backend**
   - Visit: `https://your-backend-url.herokuapp.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**
   - Visit your frontend URL
   - Try registering a user
   - Try logging in
   - Test movie browsing and search

3. **Test Admin Features**
   - Login as admin
   - Try adding a movie
   - Try editing a movie
   - Try deleting a movie

## Troubleshooting

### Backend Issues

- **Application Error**: Check Heroku logs: `heroku logs --tail`
- **Database Connection Error**: Verify MongoDB Atlas IP whitelist
- **CORS Error**: Update CORS settings with frontend URL

### Frontend Issues

- **API Connection Error**: Verify `REACT_APP_API_URL` is correct
- **Build Errors**: Check build logs in Vercel/Netlify dashboard
- **Environment Variables**: Ensure variables are set correctly

### Common Issues

1. **Environment Variables Not Loading**
   - Restart the application after adding variables
   - Verify variable names are correct

2. **Database Connection Timeout**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string is correct

3. **Queue Errors**
   - Redis is optional - app will work without it
   - Check Redis connection URL if using queue

## Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend is accessible and loading
- [ ] User registration works
- [ ] User login works
- [ ] Movie browsing works
- [ ] Search functionality works
- [ ] Admin can add movies
- [ ] Admin can edit movies
- [ ] Admin can delete movies
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] Database is connected
- [ ] Admin user is created

## Monitoring

- **Backend**: Use Heroku/Railway/AWS monitoring tools
- **Frontend**: Use Vercel/Netlify analytics
- **Database**: Use MongoDB Atlas monitoring
- **Errors**: Set up error tracking (Sentry, LogRocket, etc.)

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB password is strong
- [ ] CORS is restricted to frontend domain
- [ ] Environment variables are not exposed
- [ ] Admin routes are protected
- [ ] Input validation is working
- [ ] HTTPS is enabled (automatic on most platforms)

