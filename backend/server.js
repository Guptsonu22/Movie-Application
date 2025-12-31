const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  // If it's an API call that wasn't found, return 404 (handled by previous API routes if structured correctly, but here we check prefix)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API Route not found'
    });
  }
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movieapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.log('Running in OFFLINE MODE (No Database Connection)');
    // Start server anyway for offline mode
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running in OFFLINE MODE on port ${PORT}`);
    });
  });

module.exports = app;

