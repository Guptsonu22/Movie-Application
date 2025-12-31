const express = require('express');
const { getMovies, addMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getMovies);
router.post('/', protect, admin, addMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);
// Additional explicit search/sort routes mapped to getMovies with query params
router.get('/search', getMovies);
router.get('/sorted', getMovies);

module.exports = router;
