const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const Movie = require('../models/Movie');
const { authenticate, authorize } = require('../middleware/auth');
const { addMovieToQueue, addMovieDirectly } = require('../utils/queue');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get all movies with pagination
// @access  Public
const MOCK_MOVIES = [
  { _id: '1', title: 'The Shawshank Redemption', rating: 9.3, duration: 142, description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg', releaseDate: '1994-09-22' },
  { _id: '2', title: 'The Godfather', rating: 9.2, duration: 175, description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg', releaseDate: '1972-03-24' },
  { _id: '3', title: 'The Dark Knight', rating: 9.0, duration: 152, description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', releaseDate: '2008-07-18' },
  { _id: '4', title: 'Pulp Fiction', rating: 8.9, duration: 154, description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg', releaseDate: '1994-10-14' },
  { _id: '5', title: 'Inception', rating: 8.8, duration: 148, description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg', releaseDate: '2010-07-16' }
];

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let movies, total;
    try {
      movies = await Movie.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      total = await Movie.countDocuments();
    } catch (dbError) {
      console.warn('Database fetch failed, returning MOCK DATA');
      // Filter mock data if needed using skip/limit
      movies = MOCK_MOVIES.slice(skip, skip + limit);
      total = MOCK_MOVIES.length;
    }

    res.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movies'
    });
  }
});

// @route   GET /api/movies/sorted
// @desc    Get sorted movies
// @access  Public
router.get('/sorted', [
  query('sortBy')
    .isIn(['name', 'rating', 'releaseDate', 'duration'])
    .withMessage('sortBy must be one of: name, rating, releaseDate, duration'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sortBy, order = 'desc' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Map sortBy to database field
    const sortFieldMap = {
      name: 'title',
      rating: 'rating',
      releaseDate: 'releaseDate',
      duration: 'duration'
    };

    const sortField = sortFieldMap[sortBy];
    const sortOrder = order === 'asc' ? 1 : -1;

    const sortObj = { [sortField]: sortOrder };

    let movies, total;
    try {
      movies = await Movie.find()
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean();
      total = await Movie.countDocuments();
    } catch (dbError) {
      console.warn('Database fetch failed for sorted movies, using MOCK DATA');
      // Sort mock data
      const sortedMock = [...MOCK_MOVIES].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle strings (case insensitive)
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return -1 * sortOrder;
        if (valA > valB) return 1 * sortOrder;
        return 0;
      });

      movies = sortedMock.slice(skip, skip + limit);
      total = sortedMock.length;
    }

    res.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      sortBy,
      order
    });
  } catch (error) {
    console.error('Get sorted movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sorted movies'
    });
  }
});

// @route   GET /api/movies/search
// @desc    Search movies by name or description
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let results = [];
    let total = 0;

    try {
      // Text search using MongoDB text index
      const movies = await Movie.find({
        $text: { $search: q }
      }, {
        score: { $meta: 'textScore' }
      })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean();

      // Fallback to regex search if text search doesn't work
      const regexMovies = movies.length === 0
        ? await Movie.find({
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        })
          .skip(skip)
          .limit(limit)
          .lean()
        : [];

      results = movies.length > 0 ? movies : regexMovies;
      total = results.length; // Approximate total for this simplistic view, or fetch real count
      if (movies.length === 0) total = await Movie.countDocuments({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      });

    } catch (dbError) {
      console.warn('Database search failed, using MOCK DATA');
      // Filter mock data
      const searchLower = q.toLowerCase();
      const filtered = MOCK_MOVIES.filter(movie =>
        movie.title.toLowerCase().includes(searchLower) ||
        movie.description.toLowerCase().includes(searchLower)
      );

      results = filtered.slice(skip, skip + limit);
      total = filtered.length;
    }

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      query: q
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching movies'
    });
  }
});

// @route   GET /api/movies/:id
// @desc    Get single movie by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let movie;
    const { id } = req.params;

    // 1. Try DB if ID is valid MongoDB ID
    if (mongoose.Types.ObjectId.isValid(id)) {
      try {
        movie = await Movie.findById(id);
      } catch (dbError) {
        console.warn('Database fetch failed for single movie:', dbError.message);
        // Don't crash, just proceed to check mock data
      }
    }

    // 2. If not found in DB (or DB failed, or invalid ID), check Mock Data
    if (!movie) {
      console.log('Checking Mock Data for ID:', id);
      movie = MOCK_MOVIES.find(m => m._id === id);
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movie'
    });
  }
});

// @route   POST /api/movies
// @desc    Add a new movie (Admin only)
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  body('releaseDate').isISO8601().withMessage('Release date must be a valid date'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const movieData = req.body;

    // Try to use queue for lazy insertion (better for concurrency)
    // Fallback to direct insertion if queue is not available
    try {
      // For offline mode check first, if connection is bad we might skip queue entirely
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }

      const job = await addMovieToQueue(movieData);
      return res.status(202).json({
        success: true,
        message: 'Movie queued for insertion',
        jobId: job.id
      });
    } catch (queueError) {
      // Fallback to direct insertion if queue fails
      console.warn('Queue/DB unavailable, attempting direct/mock insertion');

      try {
        // If DB is offline, addMovieDirectly might fail if it relies on DB
        // We'll wrap it or check connection.
        if (mongoose.connection.readyState === 1) {
          const result = await addMovieDirectly(movieData);
          return res.status(201).json({
            success: true,
            message: `Movie ${result.action} successfully`,
            data: result.movie
          });
        } else {
          throw new Error('Database connection failed');
        }
      } catch (dbErr) {
        console.warn('Using MOCK STORE for new movie');
        const newMovie = {
          _id: Date.now().toString(),
          ...movieData,
          poster: movieData.poster || 'https://via.placeholder.com/300x450'
        };
        MOCK_MOVIES.push(newMovie);
        return res.status(201).json({
          success: true,
          message: 'Movie added successfully (Offline Mode)',
          data: newMovie
        });
      }
    }
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding movie'
    });
  }
});

// @route   PUT /api/movies/:id
// @desc    Update movie (Admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('rating').optional().isFloat({ min: 0, max: 10 }),
  body('releaseDate').optional().isISO8601(),
  body('duration').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let movie;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        movie = await Movie.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
      } catch (dbErr) {
        console.warn('DB Update failed, checking mock');
      }
    }

    if (!movie) {
      // Check mock data
      const index = MOCK_MOVIES.findIndex(m => m._id === req.params.id);
      if (index !== -1) {
        MOCK_MOVIES[index] = { ...MOCK_MOVIES[index], ...req.body };
        movie = MOCK_MOVIES[index];
      }
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID'
      });
    }
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating movie'
    });
  }
});

// @route   DELETE /api/movies/:id
// @desc    Delete movie (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    let movie;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        movie = await Movie.findByIdAndDelete(req.params.id);
      } catch (dbErr) {
        console.warn('DB delete failed, checking mock');
      }
    }

    if (!movie) {
      // Check mock data
      const index = MOCK_MOVIES.findIndex(m => m._id === req.params.id);
      if (index !== -1) {
        movie = MOCK_MOVIES[index]; // Store deleted movie to return
        MOCK_MOVIES.splice(index, 1);
      }
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID'
      });
    }
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting movie'
    });
  }
});

module.exports = router;

