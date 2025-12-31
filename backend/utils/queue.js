const Queue = require('bull');
const Movie = require('../models/Movie');

// Create a queue for movie insertion
// In production, use Redis URL from environment variable
let movieQueue;
let queueAvailable = false;

try {
  movieQueue = new Queue('movie insertion', {
    redis: process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  // Check if queue is available
  movieQueue.on('ready', () => {
    queueAvailable = true;
    console.log('Queue system ready');
  });

  movieQueue.on('error', (error) => {
    console.warn('Queue error (will use direct insertion):', error.message);
    queueAvailable = false;
  });
} catch (error) {
  console.warn('Queue initialization failed (will use direct insertion):', error.message);
  queueAvailable = false;
}

// Process jobs from the queue (only if queue is available)
if (movieQueue) {
  movieQueue.process(async (job) => {
    try {
      const movieData = job.data;
      
      // Check if movie already exists (by title or imdbId)
      const existingMovie = await Movie.findOne({
        $or: [
          { title: movieData.title },
          ...(movieData.imdbId ? [{ imdbId: movieData.imdbId }] : [])
        ]
      });

      if (existingMovie) {
        // Update existing movie instead of creating duplicate
        const updatedMovie = await Movie.findByIdAndUpdate(
          existingMovie._id,
          movieData,
          { new: true, runValidators: true }
        );
        return { action: 'updated', movie: updatedMovie };
      }

      // Create new movie
      const movie = await Movie.create(movieData);
      return { action: 'created', movie };
    } catch (error) {
      console.error('Queue processing error:', error);
      throw error;
    }
  });

  // Handle completed jobs
  movieQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed: ${result.action}`);
  });

  // Handle failed jobs
  movieQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });
}

// Add movie to queue
const addMovieToQueue = async (movieData) => {
  if (!movieQueue || !queueAvailable) {
    throw new Error('Queue not available');
  }
  try {
    const job = await movieQueue.add(movieData, {
      priority: 1,
      delay: 0 // Process immediately, but through queue for concurrency control
    });
    return job;
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
};

// Fallback function if Redis is not available
const addMovieDirectly = async (movieData) => {
  try {
    const existingMovie = await Movie.findOne({
      $or: [
        { title: movieData.title },
        ...(movieData.imdbId ? [{ imdbId: movieData.imdbId }] : [])
      ]
    });

    if (existingMovie) {
      const updatedMovie = await Movie.findByIdAndUpdate(
        existingMovie._id,
        movieData,
        { new: true, runValidators: true }
      );
      return { action: 'updated', movie: updatedMovie };
    }

    const movie = await Movie.create(movieData);
    return { action: 'created', movie };
  } catch (error) {
    console.error('Direct movie insertion error:', error);
    throw error;
  }
};

module.exports = {
  movieQueue,
  addMovieToQueue,
  addMovieDirectly
};

